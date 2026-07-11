const AiService = require('../../../utils/ai.js');

Page({
  data: {
    occasions: ['俱乐部例会', '工作坊', '演讲马拉松', '即兴专场', '迎新活动'],
    occasionIndex: 0,
    keyword: '',
    loading: false,
    themes: [],
    streamText: ''
  },

  onOccasionChange(e) {
    this.setData({ occasionIndex: Number(e.detail.value) });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  /** 调用混元 AI 生成主题灵感 */
  async onGenerate() {
    if (this.data.loading) return;
    const occasion = this.data.occasions[this.data.occasionIndex];
    const keyword = (this.data.keyword || '').trim();
    this.setData({ loading: true, themes: [], streamText: '' });
    try {
      const themes = await AiService.generateThemeIdeas(occasion, keyword, (text) => {
        this.setData({ streamText: text.slice(-200) });
      });
      this.setData({ themes, streamText: '', loading: false });
      if (!themes.length) {
        wx.showToast({ title: '未解析到主题，请重试', icon: 'none' });
      }
    } catch (err) {
      this.setData({ loading: false });
      wx.showModal({
        title: 'AI 生成失败',
        content: (err && err.message) || '请检查云开发 AI 配置',
        showCancel: false
      });
    }
  },

  onCopy(e) {
    const title = e.currentTarget.dataset.title;
    wx.setClipboardData({
      data: title,
      success: () => wx.showToast({ title: '已复制', icon: 'success' })
    });
  },

  /** 写入本地并跳转议程页预填主题 */
  onUseAgenda(e) {
    const title = e.currentTarget.dataset.title;
    wx.setStorageSync('agenda_theme_prefill', title);
    wx.navigateTo({
      url: `/pages/role/agenda/edit/edit?theme=${encodeURIComponent(title)}`
    });
  }
});
