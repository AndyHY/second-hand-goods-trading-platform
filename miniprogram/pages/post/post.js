var common = require('../common/common.js')
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postTitle: '', //帖子的内容
    postContent: '', //帖子的标题
    postHeadPortrait: '', //楼主的头像
    postNickName: '', //楼主的昵称
    postImage: ['../../images/add.png'],
    postImageCloudID: []

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {

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
    wx.reLaunch({
      url: '../index/index',
    })
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

  },
  //对标题输入时出发
  postTitleInput: function (e) {
    var postTitle = e.detail.value
    if (postTitle.length == 30) {
      wx.showToast({
        title: '标题长度不能超过30个字',
        icon: 'none',
        duration: 2000,
      })
    }
    this.setData({
      postTitle: postTitle
    })
  },
  //对内容输入时触发
  postContentInput: function (e) {
    this.data.postContent = e.detail.value
    this.setData({
      postContent: this.data.postContent
    })
  },
  //点击发帖按钮触发,将输入框的值传入到数据库中
  postButton: common.throttle(function () {
    var that = this;
    //首先需要得到发帖时间和发帖时间戳
    var date = new Date()
    var postTime = common.buildTimes(date)
    var postTimeStamp = common.buildTimeStamp(date)
    //得到了发帖时间
    if (this.data.postTitle != '' && this.data.postContent != '') {
      if (that.data.postImage.length >= 2) {
        var timestamp = Date.parse(new Date());
        var length = that.data.postImage.length;
        for (var i = 0; i < length - 1; i++) {
          wx.cloud.uploadFile({
            cloudPath: 'photograph/' + app.globalData.myOpenid+'_'+timestamp+'_'+i+'_'+that.data.postImage[i].match(/\.[^.]+?$/)[0],
            filePath: that.data.postImage[i],
            success: res => {
              that.data.postImageCloudID.push(res.fileID);
              if (that.data.postImageCloudID.length == length - 1) {
                const db = wx.cloud.database();
                db.collection('Post').add({
                  data: {
                    time: postTime,
                    timeStamp: postTimeStamp,
                    postTitle: that.data.postTitle,
                    postContent: that.data.postContent,
                    postImageCloudID: that.data.postImageCloudID
                  },
                  success(res) {
                    that.upDateMyPost(res)
                    that.upDateMyPostStroage(res,postTime,postTimeStamp)
                  }
                })
                wx.showToast({
                  title: '发布成功',
                  icon: 'none',
                  duration: 2000,
                  success: res => {
                    setTimeout(() => {
                      wx.reLaunch({
                        url: '../index/index'
                      })  
                    }, 2000)
                  }
                })
              }
            },
            fail: err => {
              console.log("fail to upload messageImage")
            }
          })
        }
      } else {
        //当没有图片只有文字信息时
        const db = wx.cloud.database();
        db.collection('Post').add({
          data: {
            time: postTime,
            timeStamp: postTimeStamp,
            postTitle: that.data.postTitle,
            postContent: that.data.postContent
          },
          success(res) {
            that.upDateMyPost(res)
            that.upDateMyPostStroage(res,postTime,postTimeStamp)
          }
        })
        wx.showToast({
          title: '发布成功',
          icon: 'none',
          duration: 2000,
        })
        wx.reLaunch({
          url: '../index/index'
        });
      }
    } else if (this.data.postTitle == '' && this.data.postContent != '') {
      wx.showToast({
        title: '请输入标题',
        icon: 'none',
        duration: 2000
      })
    } else if (this.data.postTitle != '' && this.data.postContent == '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000
      })     
    } else {
      wx.showToast({
        title: '请输入标题和内容',
        icon: 'none',
        duration: 2000
      })   
    }
  }, 3000),
  //添加图片
  photographInput: function (e) {
    var that = this
    if( e.currentTarget.dataset.index+1 == this.data.postImage.length) {
      wx.chooseImage({
        count: 9,
        sizeType: ['original'],
        sourceType: ['album', 'camera'],
        success(res) {
          var postImage = that.data.postImage
          const tempFilePaths = res.tempFilePaths
          var temp = postImage.pop()
          postImage = postImage.concat(tempFilePaths)
          postImage.push(temp)
          that.setData({
            postImage: postImage
          })
        },
      })
    }else {
      wx.previewImage({
        current: this.data.postImage[e.currentTarget.dataset.index], 
        urls: this.data.postImage.slice(0,this.data.postImage.length-1)
      })
    }
  },
  deleteImage:function(e) {
    this.data.postImage.splice(e.currentTarget.dataset.index, 1);
    this.setData({
      postImage:this.data.postImage,
    })
  },
  upDateMyPost:function(supres) {
    db.collection('MyPost').where({
      _openid:app.globalData.myOpenid
    }).get({
      success(res) {
        var myPostTemp = res.data[0].myPost
        myPostTemp.push(supres._id)
        db.collection('MyPost').doc(res.data[0]._id).update({
          data:{
            myPost:myPostTemp
          },
          success(res) {
            console.log('add MyPost')
            console.log(res)
            console.log('add MyPost')
          }
        })
      }
    })
  },
  upDateMyPostStroage:function(supres,postTime,postTimeStamp) {
    var that = this
    wx.getStorage({
      key: 'myPost',
      success (res) {
        var temp = {
          time:postTime,
          _id:supres._id,
          _openid:app.globalData.myOpenid,
          timeStamp:postTimeStamp,
          postTitle:that.data.postTitle,
          postContent:that.data.postContent,
          imageNum:that.data.postImageCloudID.length
        }
        var resTemp = res.data
        resTemp.push(temp)
        console.log(resTemp)
        wx.setStorage({
          key:"myPost",
          data:resTemp
        })
      },
      fail (err) {
        console.log('setp myPost Storage');
        wx.setStorage({
          key:"myPost",
          data: [{
            time:postTime,
            _id:supres._id,
            _openid:app.globalData.myOpenid,
            timeStamp:postTimeStamp,
            postTitle:that.data.postTitle,
            postContent:that.data.postContent,
            imageNum:that.data.postImageCloudID.length
          }]
        })
      }
    })
  }
})