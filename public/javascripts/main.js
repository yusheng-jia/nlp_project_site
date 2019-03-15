var api_n = "http://40.125.167.197/sms_n_account"
var api_m = "http://40.125.167.197/sms_m_account"
var app = angular.module("app",['ngFileUpload'])

app.controller("main",function($scope, $interval, $http, Upload){
  $scope.status = "start"
  $scope.status_text = "其它"
  $scope.names = ["M","N"]
  $scope.progress = 0
  $scope.showProcess = false
  $scope.processTimer = null
  $scope.rejectType = ""

  $scope.singleJudge = function(){
    console.log($scope.selectedName)
    if($scope.selectedName == "M"){
      api_url = api_m
    }else{
      api_url = api_n
    }
    if($scope.message == ""){
      alert("输入内容不能为空")
      return;
    }
    console.log("url: " + api_url)
    $http({
      url:api_url,
      method:'POST',
      data:{
        "query":$scope.message,
        "userId":"dev001"
      }
    }).then(res=>{
      console.log(res.data)
      if(res.data.name == "reject"){
        $scope.status = "no"
        $scope.status_text = "未通过"
      }else if(res.data.name == "normal"){
        $scope.status = "yes"
        $scope.status_text = "已通过"
      }else {
        $scope.status = "chat"
        $scope.status_text = "聊天"
      }
      $scope.rejectType = res.data.type
    },error=>{
      console.log(error)
      alert("出错了")
    })
  }

  $scope.submit = function() {
    if($scope.showProcess){
      alert("已在进行中")
    }else{
      if ($scope.form2.file.$valid && $scope.file) {
        $scope.upload($scope.file);
      }else{
        alert("文件格式不对")
      }
    }
  };

  $scope.upload = function (file) {
    console.log("file : " + file)
    Upload.upload({
        url: '/file-upload',
        data: {file: file, 'type':$scope.selectedName}
    }).then(function (resp) {
      $scope.progress = 0
      $scope.showProcess = true
      console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      $scope.processTimer = $interval(checkStatus,1000)
    }, function (resp) {
      console.log('Error status: ' + resp.status);
    }, function (evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
  };
  
  $scope.$on("$destroy", function(){
    $interval.cancel($scope.processTimer);
  });

  function checkStatus(){
    $http.get('/file_status').then(res=>{
      $scope.progress = parseInt(res.data.status*100)
      if ($scope.progress == 100){
        if($scope.processTimer !=null){
          $interval.cancel($scope.processTimer);
          $scope.showProcess = false
        }
      }
    },error=>{
      console.log("获取进度出错 " + error)
      if($scope.processTimer !=null){
        $interval.cancel($scope.processTimer);
      }
    })
  }
})