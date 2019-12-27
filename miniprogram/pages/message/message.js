var app = getApp();

// pages/message/message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chatRecord: [],
    toView: '',
    scroll_height: wx.getSystemInfoSync().windowHeight,
    mode: true
  },

//跳转到聊天页面
  toChat: function(e){
    var hisopenid = e.currentTarget.dataset.hisopenid
    console.log(hisopenid)
    var url = "../chat/chat?"+"hisopenid="+hisopenid
    wx.navigateTo({
      url: url
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that=this;
    const db=wx.cloud.database();
    db.collection('chatRecord').where({
      hisInformation: {
        hisopenid: app.globalData.myOpenid
      }
    }).get({
      success(res){
        var chatRecordTemp = [];
        for (var index in res.data) {
          chatRecordTemp.push(res.data[index].hisInformation)
          chatRecordTemp[index]._id = res.data[index]._id;
        }
        console.log(chatRecordTemp)
        that.setData({
          chatRecord: chatRecordTemp
        })
      },
      fail(err){
        console.log(err)
      }
    })
  },
  /**
   * 删除记录
   */
  deleteRecord: function (e) {
    this.data.chatRecord.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      chatRecord:this.data.chatRecord
    });
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
    var that = this;
    const db = wx.cloud.database();
    db.collection('chatRecord').where({
      hisInformation: {
        hisopenid: app.globalData.myOpenid
      }
    }).get({
      success(res) {
        var chatRecordTemp = [];
        for (var index in res.data) {
          chatRecordTemp.push(res.data[index].hisInformation)
          chatRecordTemp[index]._id = res.data[index]._id;
        }
        console.log(chatRecordTemp)
        that.setData({
          chatRecord: chatRecordTemp
        })
      },
      fail(err) {
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

  }
})