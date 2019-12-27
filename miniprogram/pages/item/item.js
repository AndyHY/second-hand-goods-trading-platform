var common = require('../common/common.js')
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postData: {},
    postId: '',
    floorContent: '',
    amount: [],
    myOpenid: '',
    myPrivilege: 1,
    imageList: [],
    starClick: false, //判断是否收藏了该页面
    lzopenid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    var that = this
    // 让页面在app.js得到权限字符串之后再将其转换为权限等级
    if (app.globalData.myPrivilege) {
      that.setData({
        myPrivilege: common.privilegeLevel(app.globalData.myPrivilege),
        myOpenid: app.globalData.myOpenid,
        postId: e.id
      })
    } else {
      app.privilegeReadyCallback = res => {
        that.setData({
          myPrivilege: common.privilegeLevel(res),
          myOpenid: app.globalData.myOpenid,
          postId: e.id
        })
      }
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'initItem',
      data: {
        id: that.data.postId,
        amount: that.data.amount,
        myOpenid: that.data.myOpenid
      },
      success: res => {
        console.log("帖子首次加载成功")
        that.setData({
          postData: res.result.postData,
          amount: res.result.amount,
          imageList: res.result.result.fileList == null ? null : res.result.result.fileList,
          starClick: res.result.starClick
        })
        console.log(that.data.postData)
        var date = new Date()
        var currentTimeStamp = common.buildTimeStamp(date)
        var postTimeStamp = ''
        var floorTimeStampArray = []
        var postData = that.data.postData
        if (postData.floorContent == null) {
          var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStamp)
          that.setData({
            postData: tmpData,
          })
        } else {
          var tmpData1 = common.buildDifftime(postData.floorContent, currentTimeStamp, floorTimeStampArray)
          postData.floorContent = tmpData1
          var tmpData2 = common.buildDifftime(postData, currentTimeStamp, postTimeStamp)
          that.setData({
            postData: tmpData2,
          })
        }
        wx.hideLoading()
      },
      fail: err => {
        console.log(err)
      }
    })
    db.collection('Post').where({
      _id: this.data.postId
    }).get({
      success: function (res) {
        console.log(res)
        console.log('走到这了')
        that.setData({
          lzopenid: res.data[0]._openid
        })
      },
      fail() {
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
    var postId = this.data.postId
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          wx.showNavigationBarLoading()
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          wx.cloud.callFunction({
            name: 'initItem',
            data: {
              id: that.data.postId,
              amount: that.data.amount,
              myOpenid: that.data.myOpenid
            },
            success: res => {
              console.log("帖子刷新成功")
              that.setData({
                postData: res.result.postData,
                amount: res.result.amount,
                starClick: res.result.starClick
              })
              var date = new Date()
              var currentTimeStamp = common.buildTimeStamp(date)
              var postTimeStamp = ''
              var floorTimeStampArray = []
              var postData = that.data.postData
              var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStamp)
              if (postData.floorContent == null) {
                var tmpData = common.buildDifftime(postData, currentTimeStamp, postTimeStamp)
                that.setData({
                  postData: tmpData
                })
              } else {
                var tmpData1 = common.buildDifftime(postData.floorContent, currentTimeStamp, floorTimeStampArray)
                postData.floorContent = tmpData1
                var tmpData2 = common.buildDifftime(postData, currentTimeStamp, postTimeStamp)
                that.setData({
                  postData: tmpData2
                })
              }
              wx.hideNavigationBarLoading();
              wx.hideLoading()
              wx.stopPullDownRefresh();

            },
            fail: err => {
              console.log(err)
            }
          })
        }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //回复楼主的输入框
  floorInput: function (e) {
    this.data.floorContent = e.detail.value
    this.setData({
      floorContent: this.data.floorContent
    })
  },
  //回复楼主的按钮
  floorButton: common.throttle(function (e) {
    var that = this
    // 首先需要得到回复的时间和时间戳
    var date = new Date()
    var time = common.buildTimes(date)
    var timeStamp = common.buildTimeStamp(date)
    var floorContent = this.data.floorContent //输入框的值
    var postId = this.data.postId
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          if (floorContent == '') {
            wx.showToast({
              title: '输入内容不能为空',
              icon: 'none',
              duration: 2000
            })
          } else {
            if (this.data.postData.floorContent == null) {
              var floorContentArray = []
            } else {
              var floorContentArray = this.data.postData.floorContent
            }
            var floorOpenid = app.globalData.myOpenid
            floorContentArray.push({ floorOpenid, floorContent, time, timeStamp })
            var floorIndex = floorContentArray.length - 1 //取得当前楼层的下标
            floorContentArray[floorIndex] = { floorOpenid, floorContent, time, timeStamp, floorIndex }
            wx.cloud.callFunction({
              name: 'floorButton',
              data: {
                floorOpenid: floorOpenid,
                floorContent: floorContent,
                floorContentArray: floorContentArray,
                floorIndex: floorIndex,
                postId: that.data.postData._id,
                time: time,
                timeStamp: timeStamp
              },
              success: res => {
                console.log(res)
                that.setData({
                  floorContent: ''
                })
                that.onPullDownRefresh()
              },
              fail: err => {
                console.log(err)
              }
            })
          }
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  }, 3000),
  // 跳转到楼中楼
  goToFloorFloor: common.throttle(function (e) {
    var floorId = this.data.postData.floorId[e.currentTarget.dataset.floorindex]
    var postId = this.data.postId
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          db.collection('Floor').where({
            _id: floorId
          }).get({
            success: res => {
              if (res.data.length == 0) {
                common.showToastFloorDeleted1(that)
              } else {
                wx.navigateTo({
                  url: '../floorInfo/floorInfo?floorId=' + floorId + '&postId=' + postId,
                  success: res => {
                    console.log(res)
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              }
            },
            fail: err => {
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
  //删帖时调用云函数
  //需要传递什么参数呢？
  //当前帖子的id
  deletePost: function () {
    var that = this
    var postId = this.data.postId
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          wx.showModal({
            title: '删除',
            content: '确认删除帖子？',
            success(res) {
              if (res.confirm) {
                wx.cloud.callFunction({
                  name: 'deletePost',
                  data: {
                    postId: that.data.postData._id,
                  },
                  success(res) {
                    wx.reLaunch({
                      url: '../index/index'
                    })
                  },
                  fail: console.error
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

  },
  
  //跳转到私聊页面的按钮
  chatButton: function(){
    var url = '../chat/chat' +
      '?hisopenid=' + this.data.lzopenid
    wx.navigateTo({
      url: url
    })
  },

  //删回复时调用云函数
  //传递当前楼层的id
  deleteFloor: function (e) {
    var that = this
    var postId = this.data.postId
    var floorIndex = e.currentTarget.dataset.floorindex
    var floorId = that.data.postData.floorId[floorIndex]
    db.collection('Post').where({
      _id: postId
    }).get({
      success: res => {
        if (res.data.length == 0) {
          common.showToastPostDeleted()
        } else {
          db.collection('Floor').where({
            _id: floorId
          }).get({
            success: res => {
              if (res.data.length == 0) {
                common.showToastFloorDeleted1(that)
              } else {
                wx.showModal({
                  title: '删除',
                  content: '确认删除该楼层？',
                  success(res) {
                    if (res.confirm) {
                      console.log(floorIndex)
                      wx.cloud.callFunction({
                        name: 'deleteFloor',
                        data: {
                          floorId: floorId,
                          postId: that.data.postData._id,
                          floorIndex: floorIndex,
                        },
                        success(res) {
                          that.onPullDownRefresh()
                        },
                        fail: console.error
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

      },
      fail: err => {
        console.log(err)
      }
    })

  },
  // 全局预览图片
  previewImage: function (e) {
    var urls = []
    for (let i = 0; i < this.data.imageList.length; i++) {
      urls[i] = this.data.imageList[i].tempFileURL
    }
    wx.previewImage({
      current: this.data.imageList[e.currentTarget.dataset.imageindex].tempFileURL,
      urls: urls.slice(0)
    })
  },
  // 点击收藏
  myCollection: common.throttle(function () {
    var that = this
    // 如果没有收藏
    if (that.data.starClick == false) {
      db.collection('MyCollection').where({
        _openid: that.data.myOpenid
      }).get({
        success: res => { 
          var myCollection = res.data[0].myCollection
          // 最多收藏20个帖子
          if (myCollection.length < 20) {
            wx.getStorage({
              key: 'myCollection',
              success (res) {
                var temp = {
                  time:that.data.postData.time,
                  _id:that.data.postData._id,
                  _openid:that.data.postData._openid,
                  timeStamp:that.data.postData.timeStamp,
                  postTitle:that.data.postData.postTitle,
                  postContent:that.data.postData.postContent
                }
                var resTemp = res.data
                resTemp.push(temp)
                console.log(resTemp)
                wx.setStorage({
                  key:"myCollection",
                  data:resTemp
                })
              },
              fail (err) {
                console.log('set myCollection Storage');
                wx.setStorage({
                  key:"myCollection",
                  data: [{
                    time:that.data.postData.time,
                    _id:that.data.postData._id,
                    _openid:that.data.postData._openid,
                    timeStamp:that.data.postData.timeStamp,
                    postTitle:that.data.postData.postTitle,
                    postContent:that.data.postData.postContent
                  }]
                })
              }
            })
            myCollection.push(that.data.postData._id)
            db.collection('MyCollection').doc(res.data[0]._id).update({
              data: {
                myCollection: myCollection
              },
              success: res => {
                wx.showToast({
                  title: '收藏成功',
                  icon: 'success',
                  duration: 2000,
                  success: res => {
                    setTimeout(() => {
                      that.setData({
                        starClick: true
                      })
                    }, 1000)
                  },
                  fail: err => {
                    console.log(err)
                  }
                })
              },
              fail: err => {
                console.log(err)
              }
            })
          // 已经收藏了20个帖子，不能再收藏了
          } else {
            wx.showToast({
              title: '收藏帖子数目已达上限',
              icon: 'none',
              duration: 2000,
              success: res => {
                setTimeout(() => {}, 1000)
              },
              fail: err => {
                console.log(err)
              }
            })
          } 
        },
        fail: err => {
          console.log(err)
        }
      })
    // 如果已经收藏  
    } else {
      db.collection('MyCollection').where({
        _openid: that.data.myOpenid
      }).get({
        success: res => {
          var myCollection = res.data[0].myCollection
          var index = myCollection.indexOf(that.data.postData._id)
          myCollection.splice(index, 1)
          db.collection('MyCollection').doc(res.data[0]._id).update({
            data: {
              myCollection: myCollection
            },
            success: res => {
              wx.showToast({
                title: '取消收藏成功',
                icon: 'success',
                duration: 2000,
                success: res => {
                  setTimeout(() => {
                    that.setData({
                      starClick: false
                    })
                  }, 1000)
                },
                fail: err => {
                  console.log(err)
                }
              })
            },
            fail: err => {
              console.log(err)
            }
          })
        },
        fail: err => {
          console.log(err)
        }
      })        
    }
  }, 3000)

})