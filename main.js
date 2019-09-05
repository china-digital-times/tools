// @ts-check
/// <reference lib="es2019"/>

const fs = require("fs-extra")
const fetch = require("node-fetch").default

const indexPath = "../index"
const outputPath = "../data"

const imgReg = /src="(?:.+?)chinadigitaltimes\.net\/chinese\/files\/(.+?)(?: |")/
const imgRegG = new RegExp(imgReg, "g")

const id2link = fs.readJsonSync(`${indexPath}/id2link.json`)
const link2id = fs.readJsonSync(`${indexPath}/link2id.json`)

const imgs = fs.readFileSync(`${indexPath}/imgs.txt`, "utf-8").split(/\n/g)

/** @type {[string, string][]} */
let latest100id2title = []
try {
    latest100id2title = Object.entries(fs.readJsonSync(`${indexPath}/latest100id2title.json`) || {})
} catch { }

const n = Object.keys(id2link).length + 1713

const url = `https://chinadigitaltimes.net/chinese/wp-json/wp/v2/posts/?order=asc&per_page=100&orderby=id&offset=${n}`

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

fetch(url).then(async (r) => {

    /** @type {object[]} */
    const json = await r.json()

    json.map((j) => {

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
        latest100id2title.push([id, title])

        fs.writeFileSync(`${outputPath}/${id}.json`, output)

        const ml = content.match(imgRegG)
        if (ml) {
            ml.forEach((x) => {
                const img = x.match(imgReg)[1]
                imgs.push(img)
            })
        }

    })

}).then(() => {
    const latest100id2titleObj = Object.fromEntries(latest100id2title.slice(-100))
    return Promise.all([
        fs.writeJSON(`${indexPath}/id2link.json`, id2link, { spaces: 4 }),
        fs.writeJSON(`${indexPath}/link2id.json`, link2id, { spaces: 4 }),
        fs.writeJSON(`${indexPath}/latest100id2title.json`, latest100id2titleObj, { spaces: 4 }),
        fs.writeFile(`${indexPath}/imgs.txt`, formatImgPaths(imgs).join("\n"))
    ])
})
