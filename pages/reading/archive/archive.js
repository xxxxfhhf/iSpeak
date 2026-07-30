const { getMaterialsPage } = require('../../../utils/dailyReading.js');

const PAGE_SIZE = 20;

const KIND_LABEL = {
  poem: '诗词',
  quote_cn: '金句',
  quote_en: '英文',
  story: '故事'
};

// 一天的素材 → 列表摘要
function toDaySummary(doc) {
  const items = doc.items || [];
  const tags = items.map((it) => KIND_LABEL[it.kind] || '素材');
  const first = items[0] || {};
  const preview = (first.title || first.content || first.text || '').slice(0, 40);
  return { date: doc.date, tags, preview };
}

Page({
  data: {
    groups: [], // [{ month: '2026-07', days: [{date, tags, preview}] }]
    loading: false,
    hasMore: true,
    loadedAll: false,
    error: '',
    totalLoaded: 0
  },

  onLoad() {
    this.loadMore();
  },

  onReachBottom() {
    this.loadMore();
  },

  onPullDownRefresh() {
    this.setData({ groups: [], hasMore: true, loadedAll: false, totalLoaded: 0, error: '' });
    this.loadMore().then(() => wx.stopPullDownRefresh());
  },

  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true, error: '' });
    try {
      const docs = await getMaterialsPage({ skip: this.data.totalLoaded, limit: PAGE_SIZE });
      const days = docs.map(toDaySummary);
      const groups = this.mergeIntoGroups(this.data.groups, days);
      this.setData({
        groups,
        totalLoaded: this.data.totalLoaded + docs.length,
        hasMore: docs.length >= PAGE_SIZE,
        loadedAll: docs.length < PAGE_SIZE && this.data.totalLoaded + docs.length > 0
      });
    } catch (e) {
      this.setData({ error: (e && e.message) || '加载失败,请下拉重试' });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 把新加载的若干天按月份并入分组(同一月可能跨多次分页)
  mergeIntoGroups(groups, days) {
    const result = groups.slice();
    for (const day of days) {
      const month = (day.date || '').slice(0, 7);
      const last = result[result.length - 1];
      if (last && last.month === month) {
        last.days = last.days.concat([day]);
      } else {
        result.push({ month, days: [day] });
      }
    }
    return result;
  },

  onTapDay(e) {
    const date = e.currentTarget.dataset.date;
    if (!date) return;
    wx.navigateTo({ url: `/pages/reading/daily/daily?date=${date}` });
  }
});
