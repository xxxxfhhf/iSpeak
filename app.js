App({
  onLaunch() {
    // 检查本地存储
    const projects = wx.getStorageSync('projects');
    if (!projects) {
      wx.setStorageSync('projects', []);
    }
  }
})
