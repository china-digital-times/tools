// @ts-check
// 压缩 list

const fs = require("fs")
const basePath = "../list"

const files = fs.readdirSync(basePath)

const handler = (file) => {
    const path = basePath + "/" + file
    const data = fs.readFileSync(path, "utf-8")
    const json = JSON.parse(data)
    fs.writeFileSync(path, JSON.stringify(json))
}

files.forEach(x => {
    console.log(x)
    handler(x)
})
