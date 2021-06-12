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
  },

  onLoad: function(e) {
    var biaoshi = e.biaoshi;
    if(!biaoshi){//默认进入页面
      this.skip('/pages/scanning/index');
    } else if (biaoshi === 1) {//扫码后页面
      var tal = e.tal;
      this.skip('/pages/createQrCode/index?tal='+tal);
    }
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

  skip: function(path){
    wx.navigateTo({
      url: path,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  

})
