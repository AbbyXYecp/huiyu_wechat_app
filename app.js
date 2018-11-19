//app.js
App({
  onLaunch: function () {
    this.getSys();
    this.getUserInfo()
  },
  //获取手机信息
  getSys: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log("当前手机信息：", res)
        that.globalData.sysInfo = res;
        that.globalData.windowW = res.windowWidth;
        that.globalData.windowH = res.windowHeight;
        // that.globalData.domain = "http://localhost:3000";
        that.globalData.domain = "https://huiyutongwechat.top";
      }
    })
  },
  // 设置全局变量
  globalData: {
    lock: true
  },

  // 根据token返回user_type
  pushTokenRenderType: function (userToken){
    console.log("发起登录！&&&&&&&&&&&&& 提交userToken")
    var that = this;
    // 向服务器发起登录
    wx.request({
      url: that.globalData.domain + "/sessions/wechat_login",
      method: 'POST',
      data: { client_token: userToken },
      success: function (res) {
        console.log("标记点A：", res)
        if (res.data.status == "ok") {
          wx.setStorageSync("userToken", res.data.userToken)
          that.globalData.initialRes = res.data
          that.globalData.loginStatus = res.data.status
          that.globalData.userToken = res.data.userToken
          that.globalData.userType = res.data.userType
          console.log("根据3rd提交后，尝试从本地取出userToken,userType:", wx.getStorageSync("userToken"), that.globalData.userType)
        } else {
          console.log("提交userToken失败，正在准备提交code")
          that.pushCodeRenderType()
        }
        console.log("检测当前登录状态：", that.globalData.loginStatus)
      }
    })
  },
  // 根据code向服务器请求返回user_type
  pushCodeRenderType: function() {
    console.log("获取用户的login_code")
    var that = this;
    wx.login({
      success: function (res) {
        console.log("拿到的login_code:", res)
        if (res) {
          wx.request({
            url: that.globalData.domain + "/sessions/wechat_login",
            method: 'POST',
            data: { code: res.code, user_info: that.globalData.userInfo },
            success: function (res3) {
              console.log("后台返回的数据1:", res3)
              if (res3.data.status == "ok") {
                console.log("进入了设置3rd_session阶段")
                wx.setStorageSync("userToken", res3.data.userToken)
                that.globalData.userToken = res3.data.userToken
                that.globalData.userType = res3.data.userType
                that.globalData.initialRes = res3.data
                that.globalData.loginStatus = res3.data.status
              }
              console.log("根据微信code提交后台后，从本地尝试取出userToken,userType:", wx.getStorageSync("userToken"), that.globalData.userType)
              console.log("尝试从本地存储中拿出userToken", wx.getStorageSync("userToken"))
              console.log("当前用户类型是：", res3.data.userType)
              console.log("检测当前登录状态：", that.globalData.loginStatus)
            },
            complete: function(res){
              console.log("pushCodeRenderType最终返回的数据打印出来：", res)
            }
          })
        }
      }
    })
  },
  // 小程序初始化时的登录事件
  initialLogin: function(){
    var that = this;
    var userToken = wx.getStorageSync("userToken")
    console.log("取出本地的UserToken:", userToken)
    if (userToken) {
      that.pushTokenRenderType(userToken)
    } else {
      console.log("缓存中没有userToken，开始pushCodeRenderType")
      that.pushCodeRenderType()
    }
  },
  // 将获取userinfo封装成一个函数，方便调用
  getUserInfo: function(){
    var that = this;
    // 获取userInfo
    wx.getUserInfo({
      lang: "zh_CN",
      success: function (res) {
        that.globalData.userInfo = res.userInfo
        console.log("当前用户的userInfo", res.userInfo)
      },
      fail: function(){
        // that.getUserInfo()
        console.log("无法获取用户的UserInfo信息。。。。！！！！！！！！")
      },
      complete: function(res){
        console.log("获取完毕，查看userInfo结果：", res)
        that.initialLogin()
      }
    })
  }
})
