const {
  ROLE_SCRIPT_LIST,
  getRoleScriptTemplate,
  generateScript
} = require('../../../utils/club/roleScripts.js');

Page({
  data: {
    roleList: ROLE_SCRIPT_LIST,
    tab: 'general_host',
    fields: [],
    values: {},
    sections: [],
    pageTitle: '主持稿生成'
  },

  onLoad(options) {
    const role = (options && options.role) || 'general_host';
    this.loadRole(role);
  },

  /** 加载指定角色模板 */
  loadRole(roleId) {
    const tpl = getRoleScriptTemplate(roleId);
    const values = {};
    tpl.fields.forEach(f => { values[f.key] = ''; });
    this.setData({
      tab: roleId,
      fields: tpl.fields,
      values,
      sections: [],
      pageTitle: tpl.title + '稿'
    });
    wx.setNavigationBarTitle({ title: tpl.title + ' · 生成稿' });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.loadRole(tab);
  },

  onFieldInput(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ [`values.${key}`]: e.detail.value });
  },

  onGenerate() {
    const tpl = getRoleScriptTemplate(this.data.tab);
    const sections = generateScript(tpl, this.data.values);
    this.setData({ sections });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },

  onCopy() {
    const text = this.data.sections.map(s => `【${s.title}】\n${s.content}`).join('\n\n');
    wx.setClipboardData({ data: text, success: () => wx.showToast({ title: '已复制', icon: 'success' }) });
  }
});
