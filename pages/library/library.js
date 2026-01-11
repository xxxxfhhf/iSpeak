const Storage = require('../../utils/storage');

Page({
  data: {
    activeTab: 'cases', // cases | fragments
    
    // Data Lists
    cases: [],
    fragments: [],
    
    // Fragment Input
    newFragmentContent: '',

    // Case Modal
    showCaseModal: false,
    editingCaseId: null,
    editingCase: {
      title: '',
      content: '',
      tagsStr: ''
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const cases = Storage.getCases().map(c => ({
      ...c,
      timeStr: this.formatTime(c.createdAt)
    }));
    
    const fragments = Storage.getFragments().map(f => ({
      ...f,
      timeStr: this.formatTime(f.createdAt)
    }));

    this.setData({ cases, fragments });
  },

  formatTime(ts) {
    const date = new Date(ts);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // --- Fragment Logic ---

  onFragmentInput(e) {
    this.setData({ newFragmentContent: e.detail.value });
  },

  onSaveFragment() {
    const content = this.data.newFragmentContent.trim();
    if (!content) return;

    Storage.saveFragment({
      content,
      tags: [] // 暂不处理标签
    });

    this.setData({ newFragmentContent: '' });
    this.loadData();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  onDeleteFragment(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除碎片',
      content: '确定要删除这条灵感吗？',
      success: (res) => {
        if (res.confirm) {
          Storage.deleteFragment(id);
          this.loadData();
        }
      }
    });
  },

  onUseFragment(e) {
    const { content } = e.currentTarget.dataset;
    this._navigateToWizard(content);
  },

  // --- Case Logic ---

  onAddCase() {
    this.setData({
      showCaseModal: true,
      editingCaseId: null,
      editingCase: { title: '', content: '', tagsStr: '' }
    });
  },

  onEditCase(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.cases.find(c => c.id === id);
    if (!item) return;

    this.setData({
      showCaseModal: true,
      editingCaseId: id,
      editingCase: {
        title: item.title,
        content: item.content,
        tagsStr: (item.tags || []).join(' ')
      }
    });
  },

  closeCaseModal() {
    this.setData({ showCaseModal: false });
  },

  onCaseTitleInput(e) {
    this.setData({ 'editingCase.title': e.detail.value });
  },

  onCaseContentInput(e) {
    this.setData({ 'editingCase.content': e.detail.value });
  },

  onCaseTagsInput(e) {
    this.setData({ 'editingCase.tagsStr': e.detail.value });
  },

  saveCase() {
    const { title, content, tagsStr } = this.data.editingCase;
    if (!title || !content) {
      wx.showToast({ title: '标题和内容不能为空', icon: 'none' });
      return;
    }

    const tags = tagsStr.split(/\s+/).filter(t => t.length > 0);
    
    Storage.saveCase({
      id: this.data.editingCaseId, // null if new
      title,
      content,
      tags
    });

    this.closeCaseModal();
    this.loadData();
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  onDeleteCase(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除案例',
      content: '确定要删除这个案例吗？',
      success: (res) => {
        if (res.confirm) {
          Storage.deleteCase(id);
          this.loadData();
        }
      }
    });
  },

  onUseCase(e) {
    const { content } = e.currentTarget.dataset;
    this._navigateToWizard(content);
  },

  _navigateToWizard(content) {
    wx.showModal({
      title: '使用此素材',
      content: '将跳转到 AI 向导并以此作为初始内容？',
      success: (res) => {
        if (res.confirm) {
          // 使用 Storage 传递大文本，避免 URL 长度限制
          wx.setStorageSync('wizard_init_content', content);
          
          wx.navigateTo({
            url: '/pages/wizard/wizard',
            fail: (err) => {
              console.error('跳转失败', err);
              wx.showToast({ title: '页面跳转失败', icon: 'none' });
            }
          });
        }
      }
    });
  }
});