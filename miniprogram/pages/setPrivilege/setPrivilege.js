// pages/setPrivilege/setPrivilege.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    asker: [],
    skip: 0,
    syn_counter: 0,
    manager: [],
  },
  /**
   * 通过openid得到请求用户的头像和昵称等信息
   */
  getAskerInformation: function(openid, index, maxindex) {
    const db = wx.cloud.database();
    var that = this;
    db.collection('UserInformation').where({
      _openid: openid,
    }).get({
      success(res) {
        that.data.asker[index].icon = res.data[0].icon;
        that.data.asker[index].nickName = res.data[0].nickName;
        that.data.syn_counter++;
        if (that.data.syn_counter == maxindex) {
          that.setData({
            asker: that.data.asker
          });
          console.log('setData')
        }
      },
      fail() {
        console.log("fail to get posterInformation")
      }
    })
  },

  /**
   * 刷新
   */
  refresh: function() {
    var that = this;
    this.data.syn_counter = 0;
    this.data.manager = [];
    this.data.asker = [];
    const db = wx.cloud.database();
    db.collection('LittleMessage').where({
      name: 'privilegeMessage'
    }).get({
      success(res) {
        var supres = res;
        var counter = 0;
        var length = res.data[0].managerOpenid.length;
        console.log('length=' + length);
        for (var index in res.data[0].managerOpenid) {

          db.collection('UserInformation').where({
            _openid: supres.data[0].managerOpenid[index],
          }).get({
            success(res) {
              var managerTemp = {};
              managerTemp.icon = res.data[0].icon;
              managerTemp.nickName = res.data[0].nickName;
              managerTemp._openid = supres.data[0].managerOpenid[index];
              that.data.manager.push(managerTemp)
              counter++;
              if (counter == length) {
                that.setData({
                  manager: that.data.manager
                });
                console.log('setManager')
              }
            },
            fail() {
              console.log("fail to get ManagerInformation")
            }
          })

        }
      }
    })
    //请求者显示//
    db.collection('AskPrivilege').skip(that.data.skip).limit(20).get({
      success(res) {
        console.log(res)
        that.data.asker = res.data;
        for (var index in that.data.asker) {
          that.getAskerInformation(that.data.asker[index]._openid, index, that.data.asker.length);
        }

      },
      fail(err) {
        console.log("setPrivilege.js-function-onLoad**there is no collection like AskPrivilege**")
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (app.globalData.myPrivilege == '开发者') {
      this.refresh();
    }
  },

  /**
   * 撤销管理员 
   */
  cancelManager: function(e) {
    wx.cloud.callFunction({
      name: 'abandonPrivilege',
      data: {
        openid: this.data.manager[e.currentTarget.dataset.index]._openid
      },
      complete: res => {
        wx.showToast({
          title: '撤销成功',
          icon: 'none',
          duration: 2000
        });
        this.data.manager.splice(e.currentTarget.dataset.index, 1);
        this.setData({
          manager: this.data.manager
        })
      }
    })
  },

  /**
   * 拒绝所有申请 
   */
  rejectAll: function() {
    wx.cloud.callFunction({
      name: 'removeAllAsk',
      complete: res => {
        var number = res.result;
        if (number == 0) {
          wx.showToast({
            title: '删除失败',
            icon: 'none',
            duration: 2000
          });
        } else {
          console.log(number)
          wx.showToast({
            title: '删除数量' + number,
            icon: 'none',
            duration: 2000
          });
          this.setData({
            asker: []
          })
        }
      }
    })
  },
  /**
   * 同意申请
   */
  agreePrivilege: function(e) {
    var that = this;
    console.log('setPrivilege.js-function-agreePrivilege**show nickname**')
    console.log(this.data.asker[e.currentTarget.dataset.index].nickName)
    wx.cloud.callFunction({
      name: 'setManager',
      data: {
        openid: this.data.asker[e.currentTarget.dataset.index]._openid
      },
      complete: res => {
        if (res.result == 'success') {
          this.data.manager.push(this.data.asker.splice(e.currentTarget.dataset.index, 1)[0]);
          this.setData({
            asker: this.data.asker,
            manager: this.data.manager
          })
          wx.showToast({
            title: '设置成功',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '管理员人数已满',
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  /**
   * 拒绝申请
   */
  rejectPrivilege: function(e) {
    const db = wx.cloud.database();
    db.collection('AskPrivilege').doc(this.data.asker[e.currentTarget.dataset.index]._id).remove();
    this.data.asker.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      asker: this.data.asker
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading();
    this.refresh();
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})