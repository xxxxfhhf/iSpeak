// pages/role/agenda/edit/edit.js — 单页积木式议程搭建 + 预览 + 分享 + 导出
const { PRESETS, getPreset } = require('../../../../utils/club/agendaPresets.js');
const { calculateTimeRanges, toPreviewRows } = require('../../../../utils/club/agendaCalculator.js');
const { createBlock, BLOCK_TYPES } = require('../../../../utils/club/agendaBlocks.js');
const { DEFAULT_OFFICERS } = require('../../../../utils/club/officerConfig.js');
const { exportAgendaToExcel } = require('../../../../utils/club/agendaExport.js');
const {
  saveAgendaToCloud,
  loadAgendaFromCloud,
  saveLocalDraft,
  loadLocalDraft
} = require('../../../../utils/club/agendaCloud.js');

Page({
  data: {
    presets: PRESETS,
    activePreset: 'standard',
    showPreview: true,
    cloudDocId: '',
    agenda: {},
    previewRows: [],
    addBlockTypes: [
      { type: 'prepared_speech', label: '+ 备稿演讲' },
      { type: 'table_topics_speech', label: '+ 即兴演讲' },
      { type: 'workshop', label: '+ 工作坊' },
      { type: 'silence', label: '+ 静默' },
      { type: 'break', label: '+ 休息' },
      { type: 'eval_prepared', label: '+ 备稿点评' },
      { type: 'closing_award', label: '+ 颁奖项' }
    ]
  },

  onLoad(options) {
    // 运营工具「主题灵感」预填（在 applyAgenda 时写入）
    const themePrefill = (options.theme && decodeURIComponent(options.theme))
      || wx.getStorageSync('agenda_theme_prefill')
      || '';
    if (themePrefill) {
      this._themePrefill = themePrefill;
      wx.removeStorageSync('agenda_theme_prefill');
    }

    if (options.cloudId) {
      this.loadFromCloud(options.cloudId);
    } else if (options.localId) {
      const draft = loadLocalDraft(options.localId);
      if (draft) this.applyAgenda(draft);
      else this.applyPreset('standard');
    } else if (options.preset) {
      this.applyPreset(options.preset);
    } else {
      this.applyPreset('standard');
    }
  },

  async loadFromCloud(cloudId) {
    wx.showLoading({ title: '加载中' });
    try {
      const data = await loadAgendaFromCloud(cloudId);
      this.setData({ cloudDocId: cloudId });
      this.applyAgenda(data);
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      this.applyPreset('standard');
    } finally {
      wx.hideLoading();
    }
  },

  applyPreset(presetId) {
    const agenda = getPreset(presetId);
    agenda.officers = JSON.parse(JSON.stringify(DEFAULT_OFFICERS));
    this.applyAgenda(agenda);
    this.setData({ activePreset: presetId });
  },

  applyAgenda(agenda) {
    // 写入主题灵感预填
    if (this._themePrefill) {
      agenda.theme = this._themePrefill;
      this._themePrefill = '';
    }
    const calc = calculateTimeRanges(agenda);
    this.setData({
      agenda: calc,
      previewRows: toPreviewRows(calc)
    });
  },

  refreshPreview() {
    const calc = calculateTimeRanges(this.data.agenda);
    this.setData({
      agenda: calc,
      previewRows: toPreviewRows(calc)
    });
  },

  onPresetTap(e) {
    const id = e.currentTarget.dataset.id;
    if (id === this.data.activePreset) return;
    wx.showModal({
      title: '切换预设',
      content: '切换将覆盖当前环节配置，是否继续？',
      success: res => {
        if (res.confirm) this.applyPreset(id);
      }
    });
  },

  onMetaInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`agenda.${field}`]: e.detail.value }, () => this.refreshPreview());
  },

  onOfficerInput(e) {
    const { index, field } = e.currentTarget.dataset;
    this.setData({ [`agenda.officers[${index}].${field}`]: e.detail.value });
  },

  onBlockInput(e) {
    const { index, field } = e.currentTarget.dataset;
    this.setData({ [`agenda.blocks[${index}].${field}`]: e.detail.value }, () => this.refreshPreview());
  },

  onBlockToggle(e) {
    const index = e.currentTarget.dataset.index;
    const enabled = e.detail.value;
    this.setData({ [`agenda.blocks[${index}].enabled`]: enabled }, () => this.refreshPreview());
  },

  onAddBlock(e) {
    const type = e.currentTarget.dataset.type;
    const blocks = [...(this.data.agenda.blocks || []), createBlock(type)];
    this.setData({ 'agenda.blocks': blocks }, () => this.refreshPreview());
  },

  onRemoveBlock(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: '删除环节',
      content: '确定删除该环节？',
      success: res => {
        if (!res.confirm) return;
        const blocks = [...this.data.agenda.blocks];
        blocks.splice(index, 1);
        this.setData({ 'agenda.blocks': blocks }, () => this.refreshPreview());
      }
    });
  },

  onTogglePreview() {
    this.setData({ showPreview: !this.data.showPreview });
  },

  onSaveLocal() {
    const localId = saveLocalDraft(this.data.agenda);
    this.setData({ 'agenda.localId': localId });
    wx.showToast({ title: '已保存草稿', icon: 'success' });
  },

  async onSaveCloud() {
    wx.showLoading({ title: '同步云端...' });
    try {
      const id = await saveAgendaToCloud(this.data.agenda, this.data.cloudDocId);
      this.setData({ cloudDocId: id });
      wx.showToast({ title: '已保存，可分享', icon: 'success' });
    } catch (e) {
      wx.showModal({
        title: '云端保存失败',
        content: '请确认已开通云开发并创建集合 meeting_agendas（建议：所有用户可读可写以便协作填写）',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  async onExportExcel() {
    wx.showLoading({ title: '生成 Excel...' });
    try {
      await exportAgendaToExcel(calculateTimeRanges(this.data.agenda));
    } catch (e) {
      wx.showToast({ title: '导出失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onShareAppMessage() {
    const { cloudDocId, agenda } = this.data;
    if (cloudDocId) {
      return {
        title: `第${agenda.meetingNo || ''}次会议议程：${agenda.theme || ''}`,
        path: `/pages/role/agenda/edit/edit?cloudId=${cloudDocId}`
      };
    }
    return {
      title: '厦门演讲俱乐部 · 会议议程',
      path: '/pages/role/agenda/edit/edit?preset=standard'
    };
  }
});
