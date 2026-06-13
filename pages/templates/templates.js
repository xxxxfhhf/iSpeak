const { TEMPLATES, CATEGORIES } = require('../../utils/templates');
const { createProjectFromTemplate } = require('../../utils/draftFactory');

Page({
  data: {
    categories: CATEGORIES,
    activeCategory: 'all',
    filteredTemplates: []
  },

  onLoad() {
    this.filterTemplates('all');
  },

  onCategoryChange(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ activeCategory: id });
    this.filterTemplates(id);
  },

  filterTemplates(categoryId) {
    if (categoryId === 'all') {
      this.setData({ filteredTemplates: TEMPLATES });
    } else {
      const filtered = TEMPLATES.filter(t => t.category === categoryId);
      this.setData({ filteredTemplates: filtered });
    }
  },

  onSelectTemplate(e) {
    const { id } = e.currentTarget.dataset;
    const result = createProjectFromTemplate(id);
    if (!result) return;

    wx.showToast({ title: '创建成功', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({ url: `/pages/index/index?id=${result.projectId}` });
    }, 500);
  }
});