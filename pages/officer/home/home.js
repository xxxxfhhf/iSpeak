const { OFFICER_DUTIES, DEFAULT_OFFICERS } = require('../../../utils/club/officerConfig.js');
const { listLocalDrafts } = require('../../../utils/club/agendaCloud.js');

Page({
  data: {
    duties: OFFICER_DUTIES,
    officers: DEFAULT_OFFICERS
  },

  onCreateAgenda() {
    wx.navigateTo({ url: '/pages/role/agenda/edit/edit' });
  },

  onListAgendas() {
    const drafts = listLocalDrafts();
    if (!drafts.length) {
      wx.showToast({ title: '暂无草稿', icon: 'none' });
      return;
    }
    const names = drafts.map(d => `第${d.meetingNo || '?'}次 ${d.theme || '未命名'}`);
    wx.showActionSheet({
      itemList: names.slice(0, 6),
      success: res => {
        const d = drafts[res.tapIndex];
        wx.navigateTo({ url: `/pages/role/agenda/edit/edit?localId=${d.localId}` });
      }
    });
  }
});
