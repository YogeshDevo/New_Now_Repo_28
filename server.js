const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
var https = require('https');
var fs = require('fs');


var options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem')
};

const app = express();

app.use('/', createProxyMiddleware({ target: 'http://localhost:5001', changeOrigin: true }));
https.createServer(options, app).listen(443);
