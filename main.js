// @ts-check

const fs = require("fs")
const inputPath = "../media-list"
const outputPath = "../media-data"
const indexPath = "../media-index"

const id2file = {}
const file2id = {}

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
            source_url: url,
            title: titleObj,
            caption: captionObj,
            author,
            media_type,
            mime_type,
            post: post_id,
            media_details,
        } = j

        const date = date_gmt + "Z"
        const modified = modified_gmt + "Z"
        const title = titleObj.rendered
        const caption = captionObj.rendered

        const size = {
            width: +media_details.width,
            height: +media_details.height,
        }

        let urlDecoded
        try {
            urlDecoded = decodeURI(url)
        } catch (e) {
            return
        }

        const output = JSON.stringify({
            id,
            url: urlDecoded,
            date,
            modified,
            title,
            caption,
            author,
            post_id,
            media_type,
            mime_type,
            size,
        })

        const filePath = media_details.file

        id2file[id] = filePath
        file2id[filePath] = id

        fs.writeFileSync(`${outputPath}/${id}.json`, output)

    })
}

files.forEach(x => {
    console.log(x)
    handler(x)
})

fs.writeFileSync(`${indexPath}/id2file.json`, JSON.stringify(id2file, null, 4))
fs.writeFileSync(`${indexPath}/file2id.json`, JSON.stringify(file2id, null, 4))
