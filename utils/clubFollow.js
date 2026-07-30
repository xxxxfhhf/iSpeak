/**
 * 跳转关注公众号 — 打开指引页（复制搜索词），避免原生 API 未绑定时空白
 */
const ClubConfig = require('./clubConfig.js');

/** 打开关注指引页（主入口）；已关联时可优先原生打开公众号主页 */
function openOfficialAccount() {
  if (ClubConfig.enableNativeProfileJump && canUseNativeProfile()) {
    tryOpenNativeProfile({ onFailGoGuide: true });
    return;
  }
  goFollowGuidePage();
}

function canUseNativeProfile() {
  const username = (ClubConfig.officialAccountUsername || '').trim();
  return !!(username && typeof wx.openOfficialAccountProfile === 'function');
}

function goFollowGuidePage() {
  wx.navigateTo({
    url: '/pages/club/follow/follow',
    fail: () => showFollowFallback()
  });
}

/**
 * 尝试原生打开公众号（仅 follow 页「尝试打开」按钮调用）
 * 未绑定同主体时常见空白页，故默认不自动调用
 */
/**
 * 原生打开公众号主页
 * @param {{ onFailGoGuide?: boolean }} options 失败时是否进入关注指引页
 */
function tryOpenNativeProfile(options = {}) {
  const username = (ClubConfig.officialAccountUsername || '').trim();
  if (!username || typeof wx.openOfficialAccountProfile !== 'function') {
    if (options.onFailGoGuide) goFollowGuidePage();
    else wx.showToast({ title: '请使用搜索方式关注', icon: 'none' });
    return;
  }
  try {
    wx.openOfficialAccountProfile({
      username,
      fail: (err) => {
        console.warn('openOfficialAccountProfile fail', err);
        if (options.onFailGoGuide) {
          goFollowGuidePage();
          return;
        }
        wx.showModal({
          title: '无法直接打开',
          content: '请使用关注页复制「i演讲」在微信中搜索关注，或检查公众号微信号是否正确。',
          confirmText: '去关注页',
          success(res) {
            if (res.confirm) goFollowGuidePage();
          }
        });
      }
    });
  } catch (e) {
    console.warn('openOfficialAccountProfile error', e);
    if (options.onFailGoGuide) goFollowGuidePage();
    else showFollowFallback();
  }
}

/** 降级：弹窗说明 + 复制搜索关键词 */
function showFollowFallback() {
  const keyword = ClubConfig.searchKeywords[0] || ClubConfig.brandName;
  wx.showModal({
    title: `关注${ClubConfig.brandName}`,
    content: ClubConfig.followHint,
    confirmText: '复制关键词',
    cancelText: '知道了',
    success(res) {
      if (res.confirm) {
        wx.setClipboardData({
          data: keyword,
          success: () => wx.showToast({ title: '已复制，去微信搜索', icon: 'none' })
        });
      }
    }
  });
}

/** 复制全部搜索关键词 */
function copySearchKeywords() {
  const text = ClubConfig.searchKeywords.join(' / ');
  wx.setClipboardData({
    data: text,
    success: () => wx.showToast({ title: '搜索词已复制', icon: 'success' })
  });
}

module.exports = {
  openOfficialAccount,
  tryOpenNativeProfile,
  showFollowFallback,
  copySearchKeywords,
  ClubConfig
};
