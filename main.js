// @ts-check

const fs = require("fs-extra")
const path = require("path")
const { exec } = require("child_process")

const imgPath = "../files"
const indexPath = "../index"

const imgs = fs.readFileSync(`${indexPath}/imgs.txt`, "utf-8").split(/\n/g)

const downloadImg = (file) => {
    fs.ensureDirSync(path.dirname(file))
    exec(`wget -nv -x -O ${imgPath}/${file} https://chinadigitaltimes.net/chinese/files/${file}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
        }

        if (stderr) {
            console.error(stderr)
        } else {
            console.log(stdout)
        }
    })
}

imgs.forEach((f) => {
    if (!fs.existsSync(`${imgPath}/${f}`)) {
        downloadImg(f)
    }
})

