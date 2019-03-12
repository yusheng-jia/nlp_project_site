var express = require('express');
var router = express.Router();
var xlsx  = require("node-xlsx")
var fs = require('fs');
var http = require("http")

var n_options = {  
  hostname: '40.125.167.197',  
  path: '/sms_n_account',  
  method: 'POST',  
  headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
  }  
};

var m_options = {  
  hostname: '40.125.167.197',  
  path: '/sms_m_account',  
  method: 'POST',  
  headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
  }  
};

var options = m_options

var path = "uploads"

var array = []
var curIndex = 0

function handleFile(){
  fs.readdir(path, function(err,files){
    if (err) return console.log(err);
    files.forEach(function (file) {
      var curPath = path + "/" + file
      console.log(curPath)
      var obj = xlsx.parse(curPath);
      array = obj[0].data
      console.log(array);
      postMain(0)
     })
  })  
}

function postMain(index){
  curIndex = index
  if(index >= array.length){
    exportExcelFile()
    return;
  }
  var currentText = array[index][1]
  console.log("text : " + currentText)
  var content = JSON.stringify({"query":currentText,"userId":"dev001"})
  var req = http.request(options,function(res){
    // console.log('STATUS: ' + res.statusCode);  
    // console.log('HEADERS: ' + JSON.stringify(res.headers));  
    res.setEncoding('utf8');  
    res.on('data', function (body) { 
      var obj = eval("("+body+")"); 
      console.log('BODY: ' + obj.name); 
      array[index].push(obj.name) 
    })
    res.on('end',function(){
      postMain(index + 1)
    })
  })

  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  }) 
  //请求
  req.write(content)
  
  req.end()
}

function downFile(req, res, next){
  res.download("./sms_ok.xlsx");
}

function exportExcelFile(){
  var data = array;
  var buffer = xlsx.build([{name: "mySheetName", data: data}]);
  fs.writeFileSync('sms_ok.xlsx', buffer, 'binary');
}

function uploadFile(req, res){
  console.log(req.files);
  if(req.body.type == "M"){
    options = m_options
  }else{
    options = n_options
  }
  console.log("options : " + options)
  newPath = req.files.file.path
  console.log(newPath)
  curIndex = 0
  res.send({ret_code: '0'});
  handleFilePre(newPath)
}

function handleFilePre(newPath){
  fs.readdir(path, function(err,files){
    if (err) return console.log(err);
    files.forEach(function (file) {
      var curPath = path + "/" + file
      if(curPath != newPath)
        fs.unlinkSync(curPath)
     })
     handleFile()
  })
}

function fileStatus(req,res){
  var percentage = 0
  if(array.length == 0){
    percentage = 0
  }
  else{
    percentage = curIndex/array.length
  }
  console.log("percentage : " + percentage.toFixed(2))
  res.send({ret_code: '0', status: percentage.toFixed(2)});
}

module.exports = {
  downFile:downFile,
  uploadFile:uploadFile,
  fileStatus:fileStatus
}