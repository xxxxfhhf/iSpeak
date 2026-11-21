Page({
  onTheme() { wx.navigateTo({ url: '/pages/ops/theme/theme' }); },
  onAgenda() {
    wx.navigateTo({ url: '/pages/role/agenda/edit/edit' });
  },
  onTimer() {
    wx.navigateTo({ url: '/pages/role/timer/timer' });
  },
  onRoleIntro() {
    wx.navigateTo({ url: '/pages/role/roleIntro/roleIntro' });
  },
  onScript() {
    wx.navigateTo({ url: '/pages/role/script/script' });
  }
});
