const fs = require('fs')
const promisify = require('util').promisify
const stat = promisify(fs.stat)
const readdir = promisify(fs.readdir)

const Handlebars = require('handlebars')
const path = require('path')

const config = require('../config/defaultConfig')

const mimeType = require('../helper/mime')

const tplPath = path.join(__dirname, '../template/dir.tpl')
const source = fs.readFileSync(tplPath)
// fs 读取文件是 Buffer 字符  所以加个 toString()  转成字符串
const template = Handlebars.compile(source.toString())

const compress = require('./compress')

const range = require('./range')

const isFresh = require('./cache')

module.exports = async function (req, res, filePath) {
    try {
        const stats = await stat(filePath)
        if (stats.isFile()) {

            const contentType = mimeType(filePath)
            res.setHeader('Content-Type', contentType)

            // 判断的 是否需要 缓存, 如果有缓存  就不用返回  
            if (isFresh(stats, req, res)) {
                res.statusCode = 304
                res.end()
                return
            }

            // 判断是返回的是范围 range
            let rs
            const { code, start, end } = range(stats.size, req, res)
            if (code === 200) {
                res.statusCode = 200
                rs = fs.createReadStream(filePath)
            } else {
                res.statusCode = 206
                rs = fs.createReadStream(filePath, {start, end})
            }

            // 判断的 是否需要压缩
            if (filePath.match(config.compress)) {
                rs = compress(rs, req, res)
            }

            rs.pipe(res)

        }

        if (stats.isDirectory()) {
            const files = await readdir(filePath)
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/html')
            const dir = path.relative(config.root, filePath)

            const data = {
                title: path.basename(filePath),
                dir: dir ?  `/${dir}` : '',
                files
            }

            res.end(template(data))
        }
    } catch (err) {
        console.log(err)
        res.statusCode = 400
        res.setHeader('Content-Type', 'text/plain')
        res.end(`${filePath} is not a directory or file\n ${err.toString()}`)
    }
}