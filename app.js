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

    // 学习路径 L→G 迁移（手册 V5：沟通力体系用 G）
    try {
      require('./utils/learning/migrateIds.js').migrateLearningIdsIfNeeded();
    } catch (e) {
      console.warn('学习路径迁移跳过', e);
    }

    // 检查本地存储
    const projects = wx.getStorageSync('projects');
    if (!projects) {
      wx.setStorageSync('projects', []);
    }
  }
})
