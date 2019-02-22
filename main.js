// @ts-check

const fs = require("fs")
const inputPath = "../list"
const outputPath = "../data"
const indexPath = "../index"

const id2link = {}
const link2id = {}

const files = fs.readdirSync(inputPath)

const handler = (file) => {
    const path = inputPath + "/" + file
    const data = fs.readFileSync(path, "utf-8")
    const json = JSON.parse(data)
    json.forEach((j) => {
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
            return
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
}

files.forEach(x => {
    console.log(x)
    handler(x)
})

fs.writeFileSync(`${indexPath}/id2link.json`, JSON.stringify(id2link, null, 4))
fs.writeFileSync(`${indexPath}/link2id.json`, JSON.stringify(link2id, null, 4))
