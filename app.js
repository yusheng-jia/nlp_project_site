var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var apisRouter = require('./api/cmai')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use("/scripts",express.static('node_modules/'))
app.use(multipart({uploadDir:'./uploads'}));

app.get("/down_file",apisRouter.downFile)
app.get("/down_guard_file", apisRouter.downGuardFile)
app.get("/file_status", apisRouter.fileStatus)
app.post('/file-upload',multipartMiddleware, apisRouter.uploadFile)

module.exports = app;
