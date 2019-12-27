 // pages/chat/chat.js
var app = getApp();
var common = require('../common/common.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hisIcon: '',
    myNickName: '',
    hisopenid: '',
    myopenid:'',
    message_list: [],
    scroll_height: wx.getSystemInfoSync().windowHeight,
    page_index: 0,
    mode: true,
    toView: '',
    myIcon: '',
    messageLength: 0,
    refresh:false
  },

  //回复
  reply: function(e){
    var content = e.detail.value;
    if(content == ''){
      wx.showToast({
        title: '总要写点什么吧'
      });
      return;
    }
    const db=wx.cloud.database();
    var message_list = this.data.message_list;
    var message = {
      hisopenid: this.data.hisopenid,
      'msg_type': 'text',
      'content': content,
      creat_time: common.buildTimes(new Date())
    }
    var that=this
    db.collection('chatMessage').add({    //上传消息到数据库
      data: {
        message_list: {
        hisopenid: message.hisopenid,
        msg_type : 'text',
        content : message.content,
        creat_time : message.creat_time
        }
      },
      success(res) {
        console.log(res)
      }
    })
    db.collection('chatRecord').where({
      _openid: that.data.myopenid,
      hisInformation: {
        hisopenid: that.data.hisopenid
      }
    }).get({
      success(res) {
        console.log(res)
        if(res.data.length == 0 ){
          db.collection('chatRecord').add({
            data: {
              hisInformation: {
                myIcon: that.data.myIcon,
                myopenid: app.globalData.myOpenid,
                myNickName: that.data.myNickName,
                hisopenid: that.data.hisopenid
              }
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
 //   message_list.push(message);
    this.setData({
      message_list: message_list,
      content: ''
    })
    this.scrollToBottom();
  },

//选择图片上传
  chooseImage: function(){
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed'],
      sourceType: ['album','camera'],
      success: res => {
// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths =res.tempFilePaths;
        tempFilePaths.forEach((tempFilePath) => {
          this.upload(tempFilePath, 'image');
        })
      }
    })
  },

  preview: function (e){
//当前点击图片的地址
  var src = e.currentTarget.dataset.src;
  //遍历出使用images
  var images = [];
  this.data.message_list.forEach(function(message){
    if(message != null&&message.msg_type == 'image'){
      images.push(message.content);
    }
  });
  //预览图片
  wx.previewImage({
    urls: images,
    current: src
  });
  },

  upload: function(tempFilePath, type){
    //开始上传
    wx.showLoading({
      title: '发送中'
    });
    var formData ={
      third_session: wx.getStorageSync('third_session'),
      mpid: this.data.mpid,
      fans_id: this.data.to_uid,
      msg_type: type,
    };
    var message_list = this.data.message_list;
    const db=wx.cloud.database();
    var cloudpath='chatImage/'+app.globalData.myOpenid+Math.floor(Math.random()*1000)+'.jpg';
    wx.cloud.uploadFile({
      cloudPath: cloudpath, // 上传至云端的路径
      filePath: tempFilePath, // 小程序临时文件路径
      success: res => {
        // 返回文件 ID
        console.log(res.fileID)
        db.collection('chatMessage').add({
          data: {
            message_list:{
              hisopenid:this.data.hisopenid,
              msg_type: 'image',
              content: res.fileID,
              creat_time: common.buildTimes(new Date())
            }
          }
        })
      },
      fail: console.error
    })
    var that=this
    db.collection('chatRecord').where({
      _openid: that.data.myopenid,
      hisInformation: {
        hisopenid: that.data.hisopenid
      }
    }).get({
      success(res) {
        console.log(res)
        if (res.data.length == 0) {
          db.collection('chatRecord').add({
            data: {
              hisInformation: {
                myIcon: that.data.myIcon,
                myopenid: app.globalData.myOpenid,
                myNickName: that.data.myNickName,
                hisopenid: that.data.hisopenid
              }
            }
          })
        }
      },
      fail(err) {
        console.log(err)
      }
    })
    this.scrollToBottom();
    setTimeout(() => {
      wx.hideLoading();
    }, 500)
  },

  scrollToBottom: function () {
    this.setData({
      toView: 'row_' + (this.data.message_list.length - 1)
    });
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    this.data.hisopenid = options.hisopenid;
    const db = wx.cloud.database();
    db.collection('UserInformation').where({
      _openid: options.hisopenid
    }).get({
      success(res) {
        console.log(res)
        that.setData({
          hisIcon: res.data[0].icon
        })
      }
    })
    db.collection('UserInformation').where({
      _openid: app.globalData.myOpenid
    }).get({
      success(res) {
        that.setData({
          myIcon: res.data[0].icon,
          myNickName: res.data[0].nickName
        })
        console.log(this.data.myNickName)
      }
    })
 },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * 每秒向数据库获取最新添加的消息
   */
  getCurrentMessage: function () {
    const db = wx.cloud.database();
    var that = this;
    const _=db.command;
  
    db.collection('chatMessage').where(
      _.or([{
        _openid: this.data.hisopenid,
      message_list: {
        hisopenid: this.data.myopenid
      }
      },
      {
        _openid: this.data.myopenid,
        message_list: {
          hisopenid: this.data.hisopenid
        }
      }
      ])
    ).get({
        success(res) {
          if(res.data.length!=that.data.messageLength){
          console.log("getmessage");
          console.log(res.data);
            for (let i = that.data.messageLength ; i < res.data.length ; i ++ )
          {
             that.data.message_list.push(res.data[i].message_list);
          }
            that.scrollToBottom();
          that.data.messageLength = res.data.length;
          console.log(that.data.messageLength);
          that.setData({
            message_list: that.data.message_list
          });
          }
        },fail(){

        }
      })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that=this;
    const db = wx.cloud.database();
    const _ = db.command
    db.collection('chatMessage').where(_.or([{
      _openid: this.data.hisopenid,
      message_list: {
        hisopenid: this.data.myopenid
      }
    },
    {
      _openid: this.data.myopenid,
      message_list: {
        hisopenid: this.data.hisopenid
      }
    }
    ])).get({
      success(res) {
        var message_list_temp = [];
        for (var index in res.data) {
          message_list_temp.push(res.data[index].message_list)
        }
        console.log(message_list_temp)
        that.setData({
          messageLength: message_list_temp.length,
          message_list: message_list_temp,
          myopenid: app.globalData.myOpenid
        });
        console.log('初始长度'+that.data.messageLength)
        that.data.refresh = true;
        let myTimer =  setInterval(function () {
          if (that.data.refresh) {
            that.getCurrentMessage();
            console.log("refresh"+that.data.refresh);
          }
          else {
            clearInterval(myTimer)
          }
        }, 1000);
      },
      fail(err) {
        console.log('查找消息失败')
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
    this.data.refresh = false;
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

})