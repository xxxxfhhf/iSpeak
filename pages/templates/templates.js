const { TEMPLATES, CATEGORIES, getTemplate } = require('../../utils/templates');
const Storage = require('../../utils/storage');

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
    const template = getTemplate(id);
    
    if (!template) return;

    // 创建项目
    const projectId = Storage.createProject(`未命名 ${template.name}`);
    
    // 初始化卡片结构（无内容）
    const cards = template.structure.map((step, index) => ({
      id: projectId + '_' + index,
      type: step.type,
      title: step.title,
      typeLabel: step.title.split(' ')[0],
      intent: step.intent,
      content: '', // 空内容
      durationSec: 0,
      quotes: []
    }));

    Storage.saveProjectData(projectId, { cards });
    
    // 更新元数据
    Storage.saveProjectMeta({
      id: projectId,
      cardCount: cards.length,
      totalDurationSec: 0,
      progress: 0,
      hasUnconfirmedAi: false
    });

    wx.showToast({ title: '创建成功', icon: 'success' });
    
    setTimeout(() => {
      wx.redirectTo({
        url: `/pages/index/index?id=${projectId}`
      });
    }, 500);
  }
});