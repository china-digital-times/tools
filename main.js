// @ts-check
/// <reference lib="es2019"/>

const fs = require("fs-extra")
const fetch = require("node-fetch").default
const { Octokit } = require("@octokit/rest")

const indexPath = "./index"
const outputPath = "./data"

const github = new Octokit({ auth: process.env.TOKEN })

const imgReg = /src="(?:.+?)chinadigitaltimes\.net\/chinese\/files\/(.+?)(?: |")/
const imgRegG = new RegExp(imgReg, "g")

const id2link = fs.readJsonSync(`${indexPath}/id2link.json`)
const link2id = fs.readJsonSync(`${indexPath}/link2id.json`)

const imgs = fs.readFileSync(`${indexPath}/imgs.txt`, "utf-8").split(/\n/g)

const n = Object.keys(id2link).length + 1713

const url = `https://chinadigitaltimes.net/chinese/wp-json/wp/v2/posts/?order=asc&per_page=100&orderby=id&offset=${n}`

const siteURL = "https://china-digital-times.github.io"

/**
 * @param {string[]} l 
 */
const formatImgPaths = (l) => {
    return [...new Set(
        l.map((img) => {
            return decodeURI(img)
        })
    )].sort()
}

const downloadImg = async (file) => {
    try {
        const r = await fetch(`https://chinadigitaltimes.net/chinese/files/${file}`)
        const data = await r.buffer()
        await github.repos.createOrUpdateFileContents({
            owner: "china-digital-times",
            repo: "files",
            path: file,
            message: new Date().toISOString().split("T")[0],
            content: data.toString("base64"),
            committer: {
                email: process.env.GIT_EMAIL,
                name: process.env.GIT_NAME,
            },
        })
    } catch (err) {
        console.error(err.toString())
    }
}

const getAllId2Title = async () => {
    const ids = Object.keys(id2link)
    const entries = await Promise.all(
        ids.map(async (id) => {
            try {
                const json = await fs.readJSON(`${outputPath}/${id}.json`)
                /** @type {[string, string]} */
                const entry = [id, json.title]
                return entry
            } catch (e) {
                console.error(e)
            }
        })
    )
    return Object.fromEntries(entries.filter(Boolean))
}

fetch(url).then(async (r) => {

    /** @type {object[]} */
    const json = await r.json()

    for (const j of json) {

        const {
            id,
            date_gmt,
            modified_gmt,
            link,
            title: titleObj,
            content: contentObj,
            author,
            categories,
            tags
        } = j

        const date = date_gmt + "Z"
        const modified = modified_gmt + "Z"
        const title = titleObj.rendered
        /** @type {string} */
        const content = contentObj.rendered

        let linkDecoded
        try {
            linkDecoded = decodeURI(link)
        } catch (e) {
            linkDecoded = link
        }

        const output = JSON.stringify({
            id,
            link: linkDecoded,
            date,
            modified,
            title,
            content,
            author,
            categories,
            tags,
        })

        id2link[id] = linkDecoded
        link2id[linkDecoded] = id

        fs.writeFileSync(`${outputPath}/${id}.json`, output)

        const ml = content.match(imgRegG)
        if (ml) {
            for (const x of ml) {
                const img = x.match(imgReg)[1]
                imgs.push(img)
                await downloadImg(img)
            }
        }

    }

}).then(() => {
    return Promise.all([
        fs.writeJSON(`${indexPath}/id2link.json`, id2link, { spaces: 4 }),
        fs.writeJSON(`${indexPath}/link2id.json`, link2id, { spaces: 4 }),
        fs.writeFile(`${indexPath}/imgs.txt`, formatImgPaths(imgs).join("\n"))
    ])
}).then(async () => {
    const id2title = await getAllId2Title()
    const latest100id2titleObj = Object.fromEntries(Object.entries(id2title).slice(-100))
    return Promise.all([
        fs.writeJSON(`${indexPath}/id2title.json`, id2title, { spaces: 4 }),
        fs.writeJSON(`${indexPath}/latest100id2title.json`, latest100id2titleObj, { spaces: 4 })
    ])
}).then(async () => {
    const urls = Object.keys(id2link).map(id => `<url><loc>${siteURL}/?/id/${id}</loc></url>`)
    // maximum sitemap size is 50,000 URLs
    const chuckSize = 40000
    // split this array
    const sitemaps = new Array(Math.ceil(urls.length / chuckSize))
        .fill(() => undefined)
        .map((_, i) => urls.slice(i * chuckSize, i * chuckSize + chuckSize))
        .map((l) =>
            '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            l.join("\n") +
            '\n</urlset>\n'
        )
    await Promise.all(sitemaps.map((s, i) => {
        fs.writeFile(`${indexPath}/sitemap.${i}.xml`, s)
    }))

    // sitemap index
    const sitemapindex =
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        sitemaps.map((_, i) => {
            return `<sitemap><loc>${siteURL}/index/sitemap.${i}.xml</loc></sitemap>`
        }).join("\n") +
        '\n</sitemapindex>\n'
    fs.writeFile(`${indexPath}/sitemapindex.xml`, sitemapindex)
})
