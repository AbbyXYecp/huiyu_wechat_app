// pages/index/index.js
const common = require('../../common.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgGroupUrl: "",
    windowW: app.globalData.windowW
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // 初始化视频窗口
    this.videoContext = wx.createVideoContext('myVideo')

    // 获取打开小程序时所在的位置
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        console.log("标记点3", res)
        that.setData({
          lat: res.latitude,
          lng: res.longitude
        })
        var origin = res.longitude + ',' + res.latitude
        // var origin = "108.949333,34.266597"
        console.log("标记点6", origin)
        that.get_distance(origin)
      }
    })

    common.simpleRequest({
      url: app.globalData.domain + "/homeset/get_wechat_homeset",
      success: function (res) {
        console.log('++++++++res:',res);
        that.setData({
          homesetData: res.data.homeset,
          shopImages: res.data.shop_images,  //首页门店图片
          loadJob: "ok"
        })
      }
    })

    console.log("两点距离" + that.getDistance(34.268188,108.944725,34.264892,108.950476))

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: HYTX小程序,
      path: '/pages/index/index',
      success: function (res) {
        wx.showToast({
          title: '转发成功'
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 拔打电话
  make_call: function(){
    wx.makePhoneCall({
      phoneNumber: this.data.homesetData.phone_no
    })
  },
  // 打开地图
  show_map: function(){
    wx.openLocation({
      latitude: 22.958615,
      longitude: 113.46191,
      scale: 15,
      name: "汇宇通讯",
      address: "广州市番禺区石基镇永善村永峰路5号"
    })
  },
  // 查询两点行驶距离（步行或驾车）
  get_distance: function (origin) {
    var that = this;
    console.log("标记点2", origin)
    console.log("标记点7", that.getDistance(that.data.lat, that.data.lng, 22.958615, 113.46191))
    if (that.getDistance(that.data.lat, that.data.lng, 22.958615, 113.46191) > 5000){
      var url = 'https://restapi.amap.com/v3/direction/driving?'
    } else {
      var url = 'https://restapi.amap.com/v3/direction/walking?'
    }
    wx.request({
      url: url,
      data: { key: "f30da713208bfd50ec9d0943e21482bd", destination: "113.46191, 22.958615", origin: origin },
      success: function (res) {
        console.log("标记点1", res);
        console.log("标记点4", res.data.route.paths[0].distance + 'm');

        if (res.data.route.paths[0].distance < 1000){
          var distance = res.data.route.paths[0].distance + 'm'
        } else {
          var distance = (res.data.route.paths[0].distance / 1000).toFixed(2) + 'km'
        }
        that.setData({
          distance: distance
        })
      }
    })
  },
  // 计算两个点的直线距离
  getDistance: function (lat1, lng1, lat2, lng2) {
    lat1 = lat1 || 0;
    lng1 = lng1 || 0;
    lat2 = lat2 || 0;
    lng2 = lng2 || 0;
    var rad1 = lat1 * Math.PI / 180.0;
    var rad2 = lat2 * Math.PI / 180.0;
    var a = rad1 - rad2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var r = 6378137;
    return r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))
  },
  // 打开图片
  imgpreview: function(e){
    wx.previewImage({
      current: this.data.shopImages[e.currentTarget.dataset.index], // 当前显示图片的http链接
      urls: this.data.shopImages // 需要预览的图片http链接列表
    })
  },

  // 点击播放视频
  start_video: function(e){
    console.log("开始播放视频！");
    this.videoContext.requestFullScreen({
      direction: 0
    });
  },
  end_video: function(e){
    console.log("播放结束！")
    this.videoContext.exitFullScreen();
  }
})
