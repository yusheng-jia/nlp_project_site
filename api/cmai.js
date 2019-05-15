var express = require('express');
var router = express.Router();
var xlsx  = require("node-xlsx")
var fs = require('fs');
var http = require("http")
var sms_headers = ["类型","语料","status"];
var nlp_headers = ["账号类型","语料","type","拒绝类型"]

const n_options = {  
  hostname: '47.103.43.69',  
  path: '/sms_n_account',  
  method: 'POST',  
  headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
  }  
};

const m_options = {  
  hostname: '47.103.43.69',  
  path: '/sms_m_account',  
  method: 'POST', 
  headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
  }  
};

const sms_options = {
  hostname: '47.103.44.86',  
  path: '/coomaan/sms_check',  
  method: 'POST', 
  headers: {  
      'Content-Type': 'application/json; charset=UTF-8'  
  }
}

var options = m_options;

var path = "uploads";

var fileTpye = "xls";

var array = [];
var curIndex = 0;
var smsType = 1;

function handleFile(){
  console.log("handleFile........")
  fs.readdir(path, function(err,files){
    if (err) return console.log(err);
    files.forEach(function (file) {
      var curPath = path + "/" + file;
      console.log("处理文件PATH: " + curPath);
      if(fileTpye == 'text/csv'){
        array = handleCsvFile(curPath);
      }else{
        var obj = xlsx.parse(curPath);
        array = obj[0].data;
      }
      console.log("options : " + options)
      if(options == sms_options){
        postGuardMain(0)
      }else{
        postMain(0);
      }
     })
  })  
}

function handleCsvFile(file){
  console.log("csvFile: " + file);
  var tempArray = [];
  var data = fs.readFileSync(file);
  var row = data.toString().split("\n");
  for(var i=0; i<row.length; i++){
    tempArray.push(row[i].split(","));
  }
  return tempArray;
}

var postGuardMain = index =>{
  curIndex = index - 1;
  if(index >= array.length){
    exportExcelFile(sms_headers,"sms_guard.xlsx");
    return;
  }
  var currentText = array[index][1];
  console.log("index: " + index +" text: " + currentText);
  var content = JSON.stringify({
    "port_type":smsType,
    "content":currentText,
    "sender":"3333",
    "receiver": "3333"
  });

  var req = http.request(sms_options, res =>{
    res.setEncoding('utf8');
    res.on('data', body =>{
      try {
        var obj = eval("("+body+")"); 
        console.log('BODY: ' + obj.data); 
        array[index].push(obj.data.status);
      } catch (error) {
        
      }
    })
    res.on('end' ,() =>{
      postGuardMain(index + 1)
    })
  })
  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  }) 
  //请求
  req.write(content);
  
  req.end();
  
}

function postMain(index){
  // 生成文件后进度才能到100 所以这里当前进度减1
  curIndex = index - 1;
  if(index >= array.length){
    exportExcelFile(nlp_headers,"sms_result.xlsx");
    return;
  }
  var currentText = array[index][1];
  console.log("index: " + index +" text: " + currentText);
  var content = JSON.stringify({"query":currentText,"userId":"dev001"});
  var req = http.request(options, (res) => {
    // console.log('STATUS: ' + res.statusCode);  
    // console.log('HEADERS: ' + JSON.stringify(res.headers));  
    res.setEncoding('utf8');  
    res.on('data', function (body) { 
      try {
        var obj = eval("("+body+")"); 
        console.log('BODY: ' + obj.name); 
        array[index].push(obj.name);
        if(obj.type != ""){
          array[index].push(obj.type);
        }
      } catch (error) {
        // console.log(error)
      }
    })
    res.on('end',function(){
      postMain(index + 1);
    })
  })

  req.on('error', function (e) {  
    console.log('problem with request: ' + e.message);  
  }) 
  //请求
  req.write(content);
  
  req.end();
}

function downFile(req, res, next){
  res.download("./sms_result.xlsx");
}

function downGuardFile(req, res, next){
  res.download("./sms_guard.xlsx");
}

function exportExcelFile(headers,fileName){
  console.log("exportExcelFile")
  var data = array;
  data.unshift(headers);
  var buffer = xlsx.build([{name: "smsSheet", data: data}]);
  fs.writeFile(fileName, buffer, 'binary',function(err){
    if(err){
      console.log("生成excel文件出错:" + err);
      return false;
    }
    curIndex = curIndex + 1;
  })
  // fs.writeFileSync('sms_result.xlsx', buffer, 'binary');
}

function uploadFile(req, res){
  console.log("前端传过来的tpye: " + req.body.type);
  array = [];
  fileTpye = req.files.file.type;
  if(req.body.type == "M"){
    options = m_options;
  }else if(req.body.type == "N"){
    options = n_options;
  }else{
    options = sms_options;
    if(req.body.type == "行业短信"){
      smsType = 1;
    }else{
      smsType = 2;
    }
  }
  console.log("options : " + options);
  newPath = req.files.file.path;
  console.log(newPath);
  curIndex = 0;
  res.send({ret_code: '0'});
  handleFilePre(newPath);
}

function handleFilePre(newPath){
  fs.readdir(path, function(err,files){
    if (err) return console.log(err);
    files.forEach(function (file) {
      var curPath = path + "/" + file;
      if(curPath != newPath){
        fs.unlinkSync(curPath);
      } 
     })
     handleFile();
  })
}

function fileStatus(req,res){
  var percentage = 0
  if(array.length == 0){
    percentage = 0;
  }
  else{
    percentage = curIndex/array.length;
  }
  console.log("percentage : " + percentage.toFixed(2));
  res.send({ret_code: '0', status: percentage.toFixed(2)});
};

module.exports = {
  downFile:downFile,
  uploadFile:uploadFile,
  fileStatus:fileStatus,
  downGuardFile:downGuardFile
}