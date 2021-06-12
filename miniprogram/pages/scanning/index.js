//index.js
import QRCode from '../../components/qcCode/weapp-qrcode.js'
const app = getApp()
var qrcode;

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    hasUserInfo: false,
    logged: false,
    takeSession: false,
    requestResult: '',
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl'), // 如需尝试获取用户信息可改为false
    inputValue: '',
    path: null,
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      })
    }
  },

  getUserProfile() {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo,
          hasUserInfo: true,
        })
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo,
        hasUserInfo: true,
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        // console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            // console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  // 生成二维码
  create: function () {
    var inputValue = this.data.inputValue;
    if(!inputValue || inputValue== ''){
      return;
    }
    let that = this;
    qrcode = new QRCode('myQrcode',{
      text: '',
      width: 200,
      height: 200,
      padding: 12, // 生成二维码四周自动留边宽度，不传入默认为0
      correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
      callback: (res) => {
        // console.log('res.path=',res.path)
        that.setData({ path: res.path});
        // 接下来就可以直接调用微信小程序的api保存到本地或者将这张二维码直接画在海报上面去，看各自需求
      }
    });
    qrcode.makeCode('https://ph96.github.io/parkingCall/call.html?tel='+this.data.inputValue);
  },

 // 获取手机号
 setInput : function (e) {
    var value = e.detail.value;
    this.setData({
      inputValue: value,
    });
  },
  // 长按保存
  save: function (e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['保存到相册'],
      success(res) {
        let url = that.data.path; //e.currentTarget.dataset.url
        // console.log('url=',url);
        wx.getSetting({
          success: (res) => {
            // console.log(res);
            if (!res.authSetting['scope.writePhotosAlbum']) {   // 未授权
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success: () => {
                  that.saveImgSuccess(url);
                },
                fail: (res) => {
                  // console.log(res);
                  wx.showModal({
                    title: '保存失败',
                    content: '请开启访问手机相册的权限',
                    success(res) {
                      wx.openSetting()
                    }
                  })
                }
              })
            } else {  // 已授权
              that.saveImgSuccess(url);
            }
          },
          fail: (res) => {
            // console.log(res);
          }
        })
      },
      fail(res) {
        // console.log(res.errMsg)
      }
    })
  },

  // 同意授权保存到相册
  saveImgSuccess(url) {
    wx.getImageInfo({
      src: url,  // 通过getImageInfo将src转换成改图片的本地路径，给saveImageToPhotosAlbum使用
      success: (res) => {
        // console.log('saveImgSuccess.res=',res)
        let path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,   // filePath路径不能是网络图片路径
          success: (res) => {
            // console.log(res);
            wx.showToast({
              title: '已保存到相册',
            })
          },
          fail: (res) => {
            // console.log(res);
          }
        })
      },
      fail: (res) => {
        // console.log(res);
      }
    })
  },

})
