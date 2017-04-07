'use strict';

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
//css -> less 中间件
const less = require("less-middleware");
const os = require('os');  
const request = require('request');


const express = require('express');
const service = require('./api/nodejs/index.js');
const bodyParser = require('body-parser')

const tmpDir = os.tmpDir()+'/sms';
const config = {
    port: 1929,
    root: './app',
    index:'/index.html'
};

let app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//less
app.use(less(path.resolve(config.root) , {
    dest:tmpDir , debug:false
}));

//静态文件路径
app.use(express.static(config.root));
app.use(express.static(tmpDir));


app.post('/proxy', function(req, res) {
  var url = req.params.url;
  req.pipe(request.post(url, {form:req.body})).pipe(res);
});

app.get('/api' , function(req, res){
  service.exec(req.query.a, req.query , res);
})


app.post('/api', function(req, res) {
  console.log(req.body)
  service.exec(req.query.a, req.body , res);
});

app.get('*',(req,res)=>{
    fs.readFile(path.resolve(config.root) + config.index, "utf-8", (error, file) => {
        
        res.writeHead(200, { "Content-Type": "text/html"});
        // res.write(LP.append(file));
        res.write(file);
        res.end();
    });
    //res.sendFile(path.resolve(config.root) + config.index);
});


app.listen(config.port);

console.log(new Date().toLocaleString() + ": started. port:" + config.port);
