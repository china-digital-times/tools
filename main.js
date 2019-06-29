// @ts-check

const fs = require("fs-extra")
const fetch = require("node-fetch").default

const indexPath = "../index"
const outputPath = "../data"

const id2link = fs.readJsonSync(`${indexPath}/id2link.json`)
const link2id = fs.readJsonSync(`${indexPath}/link2id.json`)

const n = Object.keys(id2link).length + 1713

const url = `https://chinadigitaltimes.net/chinese/wp-json/wp/v2/posts/?order=asc&per_page=100&orderby=id&offset=${n}`

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

        fs.writeFileSync(`${outputPath}/${id}.json`, output)

    })

}).then(() => {
    return Promise.all([
        fs.writeJSON(`${indexPath}/id2link.json`, id2link, { spaces: 4 }),
        fs.writeJSON(`${indexPath}/link2id.json`, link2id, { spaces: 4 }),
    ])
})
