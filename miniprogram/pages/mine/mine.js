// pages/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    icon: '../../images/mine.png',
    nickName: '',
    sex: '',
    cloudIcon: '../../images/mine.png',
  },
  /**
   * 我的信息点击
   */
  myInformationHandle: function () {
    var url = '../myInformation/myInformation?' +
      'sex=' + this.data.sex +
      '&nickName=' + this.data.nickName +
      '&icon=' + this.data.icon +
      '&cloudIcon=' + this.data.cloudIcon;
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 我的收藏点击
   */
  myCollectionHandle: function () {
    wx.navigateTo({
      url: '../myCollection/myCollection',
    })
  },
  /**
   * 我的帖子点击
   */
  myPost: function() {
    wx.navigateTo({
      url: '../myPost/myPost',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    var that = this;
    const db = wx.cloud.database();
    db.collection('UserInformation').where({
      _openid: app.globalData.myOpenid,
    }).get({
      success(res) {
        //设置昵称，头像云地址，性别
        that.setData({
          nickName: res.data[0].nickName,
          cloudIcon: res.data[0].icon,
          sex: res.data[0].sex,
        })
        //为避免下载，载入本地头像
        wx.getStorage({
          key: 'userInformation',
          success(res) {
            //确认头像的本地图片是否存在
            wx.getImageInfo({
              src: '' + res.data.icon,
              //存在
              success() {
                that.setData({
                  icon: res.data.icon
                })
              },
              //不存在
              fail() {
                that.setData({
                  icon: that.data.cloudIcon,
                })
              }
            })
          },
          fail() {
            //用云端数据初始化
            console.log('fail to get userInformation of storage');
            wx.setStorage({
              key: 'userInformation',
              data: {
                icon: that.data.cloudIcon,
              }
            })
          },
        })
      }
    })
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
  onShareAppMessage: function () {

  }
})