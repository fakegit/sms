'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
//css -> less 中间件
const less = require("less-middleware");
const os = require('os');  

//localtunnel
const localtunnel = require('localtunnel');


const express = require('express');
const config = {
    port: 290,
    root: './build',
    index:'/index.html'
};

let app = express();



//静态文件路径
app.use(express.static(config.root));


//LP.init();

app.get('*',(req,res)=>{
    fs.readFile(path.resolve(config.root) + config.index, "utf-8", (error, file) => {
        
        res.writeHead(200, { "Content-Type": "text/html"});
        // res.write(LP.append(file));
        res.write(file);
        res.end();
    });
    //res.sendFile(path.resolve(config.root) + config.index);
});

app.post('*',(req,res)=>{

    fs.readFile(path.resolve(config.root) + req.url, "utf-8", (error, file) => {
        
        res.writeHead(200, { "Content-Type": "application/json"});
        res.write(file);
        res.end();
    });
    //res.sendFile(path.resolve(config.root) + config.index);
})
app.listen(config.port);

console.log(new Date().toLocaleString() + ": started. port:" + config.port);