// pages/cert/result/result.js — 认证结果页

Page({

  data: {

    certified: false,

    certDate: ''

  },



  onShow() {

    const cert = wx.getStorageSync('user_cert_result') || {};

    this.setData({

      certified: !!cert.certified,

      certDate: cert.certDate || ''

    });

  },



  /** 模拟领取证书（实际由俱乐部运营确认） */

  onClaimCert() {

    const today = new Date();

    const certDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    wx.setStorageSync('user_cert_result', { certified: true, certDate });

    this.setData({ certified: true, certDate });

    wx.showToast({ title: '恭喜成为导师！', icon: 'success' });

  }

});

