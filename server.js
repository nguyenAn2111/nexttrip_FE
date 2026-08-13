const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = 5112

const baseDir = path.join(__dirname, "public/src")

const server = http.createServer((req, res) => {

    let filePath = path.join(baseDir, req.url)

    if (req.url === "/") {
        filePath = path.join(baseDir, "index.html")
    }

    const ext = path.extname(filePath)

    const contentTypeMap = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json"
    }

    const contentType = contentTypeMap[ext] || "text/plain"

    fs.readFile(filePath, (err, content) => {

        if (err) {
            console.log("❌ Not found:", filePath)

            res.writeHead(404)
            res.end("404 Not Found")
        } else {
            res.writeHead(200, { "Content-Type": contentType })
            res.end(content)
        }

    })
})

server.listen(PORT, () => {
    console.log(`✅ Server running: http://localhost:${PORT}`)
})