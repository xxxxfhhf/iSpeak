// pages/learn/webview/webview.js — 打开课程正文中的外链
Page({
  data: { url: '' },

  onLoad(options) {
    const url = decodeURIComponent(options.url || '');
    this.setData({ url });
    wx.setNavigationBarTitle({ title: '打开链接' });
  }
});
