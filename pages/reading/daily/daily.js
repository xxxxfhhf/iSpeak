const { getTodayMaterial, getMaterialByDate, clearTodayCache } = require('../../../utils/dailyReading.js');

const KIND_LABEL = {
  poem: '诗词',
  quote_cn: '每日金句',
  quote_en: '英文金句',
  story: '经典故事'
};

// 把云端 item 归一成视图友好的结构
function toView(items) {
  return (items || []).map((it, idx) => ({
    idx,
    kind: it.kind,
    label: KIND_LABEL[it.kind] || '素材',
    title: it.title || '',
    body: it.content || it.text || '',
    meta: [it.author, it.dynasty].filter(Boolean).join(' · '),
    source: it.source || ''
  }));
}

Page({
  data: {
    loading: true,
    date: '',
    cards: [],
    error: '',
    isHistory: false // 从归档页进入时按指定日期查看
  },

  onLoad(options) {
    this.historyDate = (options && options.date) || '';
    this.setData({ isHistory: !!this.historyDate });
    if (this.historyDate) {
      wx.setNavigationBarTitle({ title: this.historyDate });
    }
    this.load();
  },

  onPullDownRefresh() {
    this.load().then(() => wx.stopPullDownRefresh());
  },

  async load() {
    this.setData({ loading: true, error: '' });
    try {
      const data = this.historyDate
        ? await getMaterialByDate(this.historyDate)
        : await getTodayMaterial();
      if (data) {
        this.setData({ date: data.date, cards: toView(data.items) });
      } else {
        this.setData({
          error: this.historyDate
            ? '该日素材不存在或已被删除'
            : '今日素材尚未生成,请稍后再试或点右上角刷新'
        });
      }
    } catch (e) {
      this.setData({ error: (e && e.message) || '加载失败' });
    } finally {
      this.setData({ loading: false });
    }
  },

  onRefresh() {
    this.load();
  },

  // 入口:查看历史素材归档
  onGoArchive() {
    wx.navigateTo({ url: '/pages/reading/archive/archive' });
  },

  // 开发/手动:强制重新生成今日素材
  async onRegenerate() {
    wx.showLoading({ title: '生成中…', mask: true });
    try {
      await wx.cloud.callFunction({ name: 'dailyMaterial', data: { force: true } });
      clearTodayCache();
      await this.load();
      wx.showToast({ title: '已刷新', icon: 'success' });
    } catch (e) {
      console.error('[daily] 重新生成失败:', e);
      wx.showModal({
        title: '生成失败',
        content: (e && (e.errMsg || e.message)) || '未知错误',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 联动:复制文本(后续可扩展为“一键用作演讲积木”)
  onCopy(e) {
    const idx = e.currentTarget.dataset.idx;
    const card = this.data.cards[idx];
    if (!card) return;
    wx.setClipboardData({
      data: card.body,
      success: () => wx.showToast({ title: '已复制', icon: 'none' })
    });
  }
});
