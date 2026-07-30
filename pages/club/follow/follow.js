// pages/club/follow/follow.js — 公众号关注指引（复制搜索词，避免原生跳转空白）
const { ClubConfig, tryOpenNativeProfile } = require('../../../utils/clubFollow.js');

Page({
  data: {
    clubName: ClubConfig.clubName,
    channels: ClubConfig.followChannels || [],
    followHint: ClubConfig.followHint,
    showOfficialAccount: true,
    canTryNative: !!(ClubConfig.officialAccountUsername && ClubConfig.enableNativeProfileJump)
  },

  /** 复制单个关键词 */
  onCopyKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword;
    wx.setClipboardData({
      data: keyword,
      success: () => wx.showToast({ title: '已复制，去微信搜索', icon: 'none' })
    });
  },

  /** 复制全部搜索词 */
  onCopyAll() {
    const text = ClubConfig.searchKeywords.join(' / ');
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '搜索词已复制', icon: 'success' })
    });
  },

  /** 可选：尝试原生打开（需同主体绑定） */
  onTryNativeOpen() {
    tryOpenNativeProfile();
  },

  onOfficialAccountLoad() {},

  onOfficialAccountError() {
    this.setData({ showOfficialAccount: false });
  }
});
