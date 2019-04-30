const api_n = "http://47.103.44.86/sms_n_account"
const api_m = "http://47.103.44.86/sms_m_account"
const guard_api = "http://tt.api.coomaan.com/coomaan/sms_check"
var app = angular.module("app",['ngFileUpload'])

app.controller("main",function($scope, $interval, $http, Upload){
  $scope.status = "start"
  $scope.guard_status = "start"
  $scope.status_text = "其它"
  $scope.types = ["M","N"]
  $scope.guardTpyes = ["行业短信","营销短信"]
  $scope.progress = 0
  $scope.showProcess = false
  $scope.processTimer = null
  $scope.rejectType = ""
  $scope.maxs1 = ""
  $scope.maxs2 = ""
  $scope.maxs3 = ""

  $scope.singleJudge = () => {
    console.log($scope.coomaanTpye)
    if($scope.coomaanTpye == "M"){
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
    }).then(res => {
      console.log(res.data)
      if(res.data.name == "reject"){
        $scope.status = "no"
        $scope.status_text = "未通过"
      }else if(res.data.name == "normal"){
        $scope.status = "yes"
        $scope.status_text = "已通过"
      }else {
        $scope.status = "chat"
        $scope.status_text = "不确定"
      }
      $scope.rejectType = res.data.type
      var max3 = res.data.max3
      if(max3[0].split(":")[0] > 0.9){
        $scope.maxs1 = max3[0]
      }else{
        $scope.maxs1 = ""
      }
      if(max3[1].split(":")[0] > 0.9){
        $scope.maxs2 = max3[1]
      }else{
        $scope.maxs2 = ""
      }
      if(max3[2].split(":")[0] > 0.9){
        $scope.maxs3 = max3[2]
      }else{
        $scope.maxs3 = ""
      }
    },error => {
      console.log(error)
      alert("出错了")
    })
  }

  $scope.guardJudge = () =>{
    console.log("guardJudge" + $scope.guardTpye)
    console.log("guardMessage: " + $scope.guardMessage)
    var port_type = $scope.guardTpye == $scope.guardTpyes[0]?1:2
    console.log("port_type: " + port_type)
    $http({
      url:guard_api,
      method:'POST',
      data:{
        "port_type":port_type,
        "content":$scope.guardMessage,
        "sender":"3333",
        "receiver": "3333"
      }
    }).then( res =>{
      console.log("成功了")
      var status =  res.data.data.status
      if(status == 300){
        $scope.guard_status = "no"
        $scope.guard_status_text = "内容或号码异常，不能发送"
      }else if(status == 1){
        $scope.guard_status = "yes"
        $scope.guard_status_text = "信息都正常，可发送"
      }else if(status == -1){
        $scope.guard_status = "chat"
        $scope.guard_status_text = "未知，未探测到"
      }
    }, error=>{
      console.log("报错了")
      console.log(error)
    })

  }
  
  $scope.submit = () => {
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

  $scope.upload = file => {
    console.log("file : " + file)
    Upload.upload({
        url: '/file-upload',
        data: {file: file, 'type':$scope.multiTpye}
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

  var checkStatus = () =>{ 
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