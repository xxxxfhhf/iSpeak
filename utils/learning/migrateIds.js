/**
 * 学习路径 ID 迁移：旧版 L1/L2/L3 → 新版 G1/G2/G3（沟通力体系）
 * 手册 V5：路径名 L 改为 G；L 预留给领导力路径（开发中）
 */
const MIGRATE_FLAG = 'learn_id_migrated_L_to_G_v1';

/** 将字符串中的 L1/L2/L3 替换为 G1/G2/G3 */
function remapId(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/L([123])/g, 'G$1');
}

/** 迁移对象的 key（保留 value） */
function remapObjectKeys(obj) {
  if (!obj || typeof obj !== 'object') return obj || {};
  const next = {};
  Object.keys(obj).forEach((key) => {
    next[remapId(key)] = obj[key];
  });
  return next;
}

/**
 * App 启动时调用一次：迁移本地进度 / 提交记录 / 会员等级
 */
function migrateLearningIdsIfNeeded() {
  try {
    if (wx.getStorageSync(MIGRATE_FLAG)) return;

    // 课程进度
    const courseMap = wx.getStorageSync('user_course_progress') || {};
    wx.setStorageSync('user_course_progress', remapObjectKeys(courseMap));

    // 路径演练进度
    const pathMap = wx.getStorageSync('user_path_progress') || {};
    wx.setStorageSync('user_path_progress', remapObjectKeys(pathMap));

    // 提交资料（key 形如 L1V1:L1V1-i2）
    const submissions = wx.getStorageSync('user_submissions') || {};
    wx.setStorageSync('user_submissions', remapObjectKeys(submissions));

    // 会员等级档案
    const profile = wx.getStorageSync('user_member_profile');
    if (profile && profile.level) {
      profile.level = remapId(profile.level);
      wx.setStorageSync('user_member_profile', profile);
    }

    wx.setStorageSync(MIGRATE_FLAG, Date.now());
    console.log('[migrate] 学习路径 ID 已从 L 迁移至 G');
  } catch (e) {
    console.warn('[migrate] 学习路径迁移失败', e);
  }
}

module.exports = {
  MIGRATE_FLAG,
  remapId,
  remapObjectKeys,
  migrateLearningIdsIfNeeded
};
