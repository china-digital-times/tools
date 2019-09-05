// @ts-check

const fs = require("fs-extra")
const { exec } = require("child_process")

const imgPath = "../files"
const indexPath = "../index"

const imgs = fs.readFileSync(`${indexPath}/imgs.txt`, "utf-8").split(/\n/g)

const downloadImg = (file) => {
    exec(`wget -nv -x -nH --cut-dirs=2 https://chinadigitaltimes.net/chinese/files/${file}`, {
        cwd: imgPath
    }, (error, stdout, stderr) => {
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

