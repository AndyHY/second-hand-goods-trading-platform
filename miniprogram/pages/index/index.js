var common = require('../common/common.js')
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postData: [],
    topPostData: [],
    myOpenid: '',
    myPrivilege: 1,
    visitTimes: 1, //访问次数，每次触底上拉时加一
    length: ''  //当前帖子数量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.request({
      url: 'www.feidudeqiu.xyz/feidu_war_exploded//source/bookInfo.json', //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        console.log('hahahahha')
        console.log(res.data)
        console.log('hahahahha')
      }
    })
    var that = this
    // 让页面在app.js得到权限字符串之后再将其转换为权限等级
    if (app.globalData.myPrivilege) {
      that.setData({
        myPrivilege: common.privilegeLevel(app.globalData.myPrivilege),
        myOpenid: app.globalData.myOpenid
      })
    } else {
      app.privilegeReadyCallback = res => {
        that.setData({
          myPrivilege: common.privilegeLevel(res),
          myOpenid: app.globalData.myOpenid
        })
      }
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'initIndex',
      success: res => {
        console.log("主页面首次加载成功")
        that.setData({
          postData: res.result.postData,
          topPostData: res.result.topPostData == null ? 0 : res.result.topPostData,
          visitTimes: 1, //初始化visitTimes
          length: res.result.length //获取当前帖子数量
        })
        console.log(that.data.PostData)
        var date = new Date()
        var currentTimeStamp = common.buildTimeStamp(date)
        var postTimeStampArray = []
        var postData = that.data.postData
        var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStampArray)
        that.setData({
          postData: tmpData,
        })
        wx.hideLoading()
      },
      fail: err => {
        console.log(err)
      }
    })

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
    var that = this
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'initIndex',
      success: res => {
        console.log("主页面刷新成功")
        that.setData({
          postData: res.result.postData,
          topPostData: res.result.topPostData == null ? 0 : res.result.topPostData,
          visitTimes: 1, //每次下拉刷新初始化visitTimes
          length: res.result.length //获取当前帖子数量
        })
        var date = new Date()
        var currentTimeStamp = common.buildTimeStamp(date)
        var postTimeStampArray = []
        var postData = that.data.postData
        var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStampArray)
        that.setData({
          postData: tmpData,
        })
        wx.hideNavigationBarLoading()
        wx.hideLoading()
        wx.stopPullDownRefresh()
      },
      fail: err => {
        console.log(err)
      }

    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'indexReachBottom',
      data: {
        visitTimes: that.data.visitTimes,
        postData: that.data.postData,
        length: that.data.length
      },
      success: res => {
        console.log(res)
        // 成功加载后访问次数加一
        that.setData({
          visitTimes: res.result.visitTimes,
          postData: res.result.postData,  
        })
        var date = new Date()
        var currentTimeStamp = common.buildTimeStamp(date)
        var postTimeStampArray = []
        var postData = that.data.postData
        var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStampArray)
        that.setData({
          postData: tmpData,
        })
        wx.hideLoading()
      },
      fail: err => {
        console.log(err)
      }
    })    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //点击按钮进入帖子,每3秒只能点击一次
  gotoItemHandle: common.throttle(function (e) {
    var that = this 
    var id = e.currentTarget.dataset.id
    db.collection('Post').where({
      _id: id
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          wx.navigateTo({
            url: '../item/item?id=' + id,
            success: function (res) {
              console.log(res)
            },
            fail: function (err) {
              console.log(err)
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }, 3000),
  //点击置顶将帖子的id添加到littleMessage集合中
  topPost: function (e) {
    var that = this
    var postID = e.currentTarget.dataset.id
    
    db.collection('LittleMessage').get({
      success: res => {
        if (res.data[0].topPostID.indexOf(postID) != -1) {
          wx.showToast({
            title: '不能重复置顶',
            icon: 'none',
            duration: 2000,
            success: res => {
              setTimeout(() => {
                wx.reLaunch({
                  url: '../index/index'
                })
              }, 1000)
            }
          })
        } else {
          wx.showModal({
            title: '置顶',
            content: '确认置顶帖子？',
            success(res) {
              if (res.confirm) {
                wx.cloud.callFunction({
                  name: 'topPost',
                  data: {
                    postID: postID
                  },
                  success: res => {
                    that.onPullDownRefresh()
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })

  }

})