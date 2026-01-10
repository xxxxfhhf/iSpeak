const Storage = require('../../utils/storage');

Page({
  data: {
    projectId: null,
    mentorSuggestions: [],
    pendingSuggestions: [],
    completedSuggestions: [],
    showPending: true,
    showCompleted: true
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ projectId: options.id });
      this.loadSuggestions(options.id);
    }
  },

  loadSuggestions(id) {
    const projectData = Storage.getProject(id);
    if (projectData && projectData.mentorSuggestions) {
      const suggestions = projectData.mentorSuggestions.map(s => ({
        ...s,
        typeLabel: this.getTypeLabel(s.text)
      }));
      
      this.setData({
        mentorSuggestions: suggestions,
        pendingSuggestions: suggestions.filter(s => s.status === 'pending'),
        completedSuggestions: suggestions.filter(s => s.status === 'completed')
      });
    }
  },

  getTypeLabel(text) {
    if (text.includes('结构') || text.includes('CTA') || text.includes('结尾')) return '结构';
    if (text.includes('语气') || text.includes('口语')) return '表达';
    return '优化';
  },

  toggleSection(e) {
    const { section } = e.currentTarget.dataset;
    if (section === 'pending') {
      this.setData({ showPending: !this.data.showPending });
    } else {
      this.setData({ showCompleted: !this.data.showCompleted });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onComplete(e) {
    const { id } = e.currentTarget.dataset;
    this.updateSuggestionStatus(id, 'completed');
  },

  onIgnore(e) {
    const { id } = e.currentTarget.dataset;
    const suggestions = this.data.mentorSuggestions.filter(s => s.id !== id);
    this.saveAndRefresh(suggestions);
  },

  onRevert(e) {
    const { id } = e.currentTarget.dataset;
    this.updateSuggestionStatus(id, 'pending');
  },

  updateSuggestionStatus(id, status) {
    const suggestions = this.data.mentorSuggestions.map(s => {
      if (s.id === id) return { ...s, status };
      return s;
    });
    this.saveAndRefresh(suggestions);
  },

  saveAndRefresh(suggestions) {
    const projectData = Storage.getProject(this.data.projectId);
    projectData.mentorSuggestions = suggestions;
    Storage.saveProjectData(this.data.projectId, projectData);
    this.loadSuggestions(this.data.projectId);
  },

  onProcess(e) {
    const { id } = e.currentTarget.dataset;
    const suggestion = this.data.mentorSuggestions.find(s => s.id === id);
    
    // 返回首页并传递参数进行定位
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.route === 'pages/index/index') {
      // 标记建议为正在处理
      wx.navigateBack({
        success: () => {
          // 这里可以触发 index 页面的特定逻辑，比如高亮积木
          if (suggestion.text.includes('CTA')) {
            // 示例：提示新增 CTA
          }
        }
      });
    }
  },

  onExportSuggestions() {
    let md = `# AI 导师建议记录\n\n`;
    md += `> 这份建议记录由 AI 导师根据您的演讲稿生成，旨在帮助您打磨出更精品的内容。\n\n`;
    
    md += `## 🔴 待处理建议\n\n`;
    if (this.data.pendingSuggestions.length === 0) {
      md += `(暂无)\n\n`;
    } else {
      this.data.pendingSuggestions.forEach(s => {
        md += `* **[${this.getTypeLabel(s.text)}]** ${s.text}\n`;
      });
    }

    md += `\n## 🟢 已完成建议\n\n`;
    if (this.data.completedSuggestions.length === 0) {
      md += `(暂无)\n\n`;
    } else {
      this.data.completedSuggestions.forEach(s => {
        md += `* ~~**[${this.getTypeLabel(s.text)}]** ${s.text}~~\n`;
      });
    }

    wx.setClipboardData({
      data: md,
      success: () => {
        wx.showToast({ title: '建议记录已复制', icon: 'success' });
      }
    });
  }
});

