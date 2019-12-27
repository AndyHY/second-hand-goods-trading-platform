// pages/myCollection/myCollection.js
var common = require('../common/common.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postData: [],
    postDataStorage:[],
    postid:[],
    myCollectionId:'',
  },
  /**
   * 初始化
   */
  initMyCollection: function () {
    this.data.postData=[];
    const db = wx.cloud.database();
    var that = this;
    db.collection('MyCollection').where({
      _openid: app.globalData.myOpenid
    }).get({
      success: function (res) {
        if (res.data.length == 0) { //没有我的收藏记录
          db.collection('MyCollection').add({
            data: {
              myCollection: [],
            }
          });
        }
        else {
          that.data.myCollectionId = res.data[0]._id;
          that.data.postid = res.data[0].myCollection;
          var countGetPost = 0;
          for (let i = 0; i < that.data.postid.length; i++) {
            db.collection('Post').where({
              _id: that.data.postid[i]
            }).get({
              success: function (res) {
                if(res.data.length!=0) { //帖子没有被删除
                  let postDataTemp = res.data[0];
                  db.collection('UserInformation').where({
                    _openid: postDataTemp._openid
                  }).get({
                    success: function (res) {
                      postDataTemp.postHeadPortrait = res.data[0].icon;
                      postDataTemp.postNickName = res.data[0].nickName;
                      postDataTemp.exist=true;
                      delete postDataTemp.postImageCloudID;
                      that.data.postData.push(postDataTemp);
                      countGetPost++;
                      if (countGetPost == that.data.postid.length) {
                        that.refreshDate();             
                      }
                    }
                  })
                }else { //帖子被删除
                  let postDataTemp = that.data.postDataStorage.find(function(item) {return item._id==that.data.postid[i]});
                  db.collection('UserInformation').where({
                    _openid: postDataTemp._openid
                  }).get({
                    success: function (res) {
                      postDataTemp.postHeadPortrait = res.data[0].icon;
                      postDataTemp.postNickName = res.data[0].nickName;
                      postDataTemp.exist=false;
                      that.data.postData.push(postDataTemp);
                      countGetPost++;
                      if(countGetPost==that.data.postid.length) {
                        that.refreshDate();
                      }
                    }
                  })
                  
                }
              }
            })
          }
        }
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('before getStorageSync');
    wx.getStorage({
      key: 'myCollection',
      success (res) {
        that.data.postDataStorage=res.data;
        that.initMyCollection();
      },
      fail (err) {
        console.log('lost the storage');
      }
    });
    console.log('after getStorageSync');
  },
  /**
   * 刷新时间和缓存
   */
  refreshDate: function () {
    var date = new Date();
    var currentTimeStamp = common.buildTimeStamp(date);
    var postTimeStampArray = [];
    var tmpData = common.buildDifftime(this.data.postData, currentTimeStamp, postTimeStampArray)
    tmpData.sort(
      function sortIndex(a, b) {
        return b.timeStamp - a.timeStamp
      }
    );
    this.setData({
      postData: tmpData
    });
  },
  /**
   * 删除我的收藏项目
   */
  deleteCollectionHandle:function (e) {
    var that = this;
    const db = wx.cloud.database();
    wx.showModal({
      title: '删除',
      content: '确认删除此收藏？',
      success(res) {
        if (res.confirm) {
          console.log(e.currentTarget.dataset.index);
          for(let i = 0; i < that.data.postDataStorage.length; i++) {
            if(that.data.postDataStorage[i]._id == that.data.postData[e.currentTarget.dataset.index]._id)
            {
              that.data.postDataStorage.splice(i,1);
              break;
            }
          }
          wx.setStorage({
            key:"myCollection",
            data: that.data.postDataStorage
          })
          that.data.postid.splice(that.data.postid.indexOf(that.data.postData[e.currentTarget.dataset.index]._id),1);
          that.data.postData.splice(e.currentTarget.dataset.index,1);
          that.setData({
            postData:that.data.postData
          });
          db.collection('MyCollection').doc(that.data.myCollectionId).update({
            data: {
              myCollection:that.data.postid
            }
          })
        } 
        else if (res.cancel) {
          
        }
      }
    })
    console.log(e.currentTarget.dataset.index)
  },
  /**
   * 跳转页面
   */
  gotoItemHandle: common.throttle(function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    const db = wx.cloud.database();
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
    this.initMyCollection();
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