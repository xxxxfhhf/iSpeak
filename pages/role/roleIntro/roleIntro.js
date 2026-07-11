const { ROLE_INTROS } = require('../../../utils/club/officerConfig.js');

Page({
  data: { roles: ROLE_INTROS },

  /** 点击角色 → 跳转主持稿页并预选模板 */
  onRoleTap(e) {
    const scriptId = e.currentTarget.dataset.scriptId;
    const role = e.currentTarget.dataset.role || '';
    if (!scriptId) {
      wx.showToast({ title: '暂无模板', icon: 'none' });
      return;
    }
    wx.navigateTo({
      url: `/pages/role/script/script?role=${scriptId}&title=${encodeURIComponent(role)}`
    });
  }
});
