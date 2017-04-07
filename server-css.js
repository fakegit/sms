'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
//css -> less 中间件
const less = require("less-middleware");

const config = {
    port: 290,
    root: './app'
};


http.createServer((req, res) => {

    let pathname = url.parse(req.url).pathname;

    if (pathname === '' || pathname === '/') {
        pathname = '/index.html';
    }

    pathname = config.root + pathname;

    //判断是否存在改文件
    fs.exists(pathname, (exist) => {
        if (!exist) {
            pathname = config.root + "/index.html";
        }

        readFile(req, res, pathname);
    });

}).listen(config.port);

console.log(new Date().toLocaleString() + ": started. port:" + config.port);

function readFile(req, res, pathname) {

    let ext = path.extname(pathname);
    // console.log('request:' + pathname);
    fs.readFile(pathname, "binary", (error, file) => {
        if (error) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Server Error:" + error);
        } else {
            res.writeHead(200, { "Content-Type": getContentTypeByExt(ext) });
            res.end(file, "binary");
        }
    });
}

//得到ContentType
function getContentTypeByExt(ext) {
    ext = ext.toLowerCase();
    if (ext === '.htm' || ext === '.html')
        return 'text/html';
    else if (ext === '.js')
        return 'application/x-javascript';
    else if (ext === '.css')
        return 'text/css';
    else if (ext === '.jpe' || ext === '.jpeg' || ext === '.jpg')
        return 'image/jpeg';
    else if (ext === '.png')
        return 'image/png';
    else if (ext === '.ico')
        return 'image/x-icon';
    else if (ext === '.woff')
        return 'application/x-font-woff';
    else if (ext === '.woff2')
        return 'application/x-font-woff2';
    else
        return 'text/plain';
}
