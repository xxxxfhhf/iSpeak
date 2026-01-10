App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
        wx.cloud.init({
            env: "cloud1-5gzzdbfrb55af36b"
          });
          console.log("初始化完成：")
    }

    // 检查本地存储
    const projects = wx.getStorageSync('projects');
    if (!projects) {
      wx.setStorageSync('projects', []);
    }
  }
})
