const Storage = require('../../utils/storage');
const { openOfficialAccount } = require('../../utils/clubFollow.js');

Page({
  data: {
    projects: [],
    filteredProjects: [],
    searchText: '',
    isSelectMode: false,
    selectedIds: {},
    selectedCount: 0,
    showNewMenu: false
  },

  onShow() {
    this.loadProjects();
    this.setData({ showNewMenu: false });
  },

  onShareAppMessage() {
    return {
      title: 'AI 演讲积木 - 让你的表达更有逻辑',
      path: '/pages/history/history'
    };
  },

  onShareTimeline() {
    return {
      title: 'AI 演讲积木 - 让你的表达更有逻辑'
    };
  },

  loadProjects() {
    const rawProjects = Storage.getProjects();
    const projects = rawProjects.map(p => {
      // 格式化时长
      const totalSec = p.totalDurationSec || 0;
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      const durationStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      // 格式化时间
      const timeAgo = this.formatTimeAgo(p.updatedAt);
      
      return {
        ...p,
        durationStr,
        timeAgo,
        typeLabel: '通用' // 统一显示为通用，或根据需要自定义
      };
    }).sort((a, b) => b.updatedAt - a.updatedAt);

    this.setData({ projects, recentProject: projects[0] || null }, () => {
      this.filterProjects();
    });
  },

  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return '刚刚';
    if (diff < hour) return Math.floor(diff / minute) + '分钟前';
    if (diff < day) return Math.floor(diff / hour) + '小时前';
    if (diff < day * 2) return '昨天';
    
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  },

  onContinueDraft() {
    const p = this.data.recentProject;
    if (p) wx.navigateTo({ url: `/pages/index/index?id=${p.id}` });
    else this.onNewProject();
  },

  onSearch(e) {
    const searchText = e.detail.value.toLowerCase();
    this.setData({ searchText }, () => {
      this.filterProjects();
    });
  },

  filterProjects() {
    const { projects, searchText } = this.data;
    if (!searchText) {
      this.setData({ filteredProjects: projects });
      return;
    }

    const filtered = projects.filter(p => 
      p.title.toLowerCase().includes(searchText) || 
      (p.typeLabel && p.typeLabel.includes(searchText))
    );
    this.setData({ filteredProjects: filtered });
  },

  onNewProject() {
    this.closeNewMenu();
    const id = Storage.createProject();
    wx.navigateTo({
      url: `/pages/index/index?id=${id}`
    });
  },

  toggleNewMenu() {
    this.setData({ showNewMenu: !this.data.showNewMenu });
  },

  closeNewMenu() {
    this.setData({ showNewMenu: false });
  },

  preventBubble() {
    // 阻止冒泡，防止点击菜单时关闭菜单
  },

  onGoToLibrary() {
    wx.navigateTo({
      url: '/pages/library/library'
    });
  },

  /** 进入路径学习首页 */
  onGoToLearning() {
    wx.navigateTo({
      url: '/pages/learn/home/home'
    });
  },

  /** 进入导师认证首页 */
  onGoToMentorCert() {
    wx.navigateTo({
      url: '/pages/cert/home/home'
    });
  },

  /** 关注公众号指引 */
  onFollowOfficialAccount() {
    openOfficialAccount();
  },

  onVoiceCoach() { wx.navigateTo({url:'/pages/coach/coach'}); },

  onNewAiWizard() {
    this.closeNewMenu();
    wx.navigateTo({
      url: '/pages/wizard/wizard'
    });
  },

  onNewFromTemplate() {
    this.closeNewMenu();
    wx.navigateTo({
      url: '/pages/templates/templates'
    });
  },

  onProjectTap(e) {
    const { id } = e.currentTarget.dataset;
    if (this.data.isSelectMode) {
      this.toggleSelect(id);
    } else {
      // 点击卡片直接进入编辑页
      wx.navigateTo({
        url: `/pages/index/index?id=${id}`
      });
    }
  },

  onShowActionSheet(e) {
    const { id, title } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['👁️ 预览全文', '✏️ 重命名', '🗑️ 删除'],
      itemColor: '#000000',
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: `/pages/preview/preview?id=${id}`
          });
        } else if (res.tapIndex === 1) {
          this.showRenameModal(id, title);
        } else if (res.tapIndex === 2) {
          this.onDelete({ currentTarget: { dataset: { id } } });
        }
      }
    });
  },

  // 重命名逻辑 (需要配合 WXML 弹窗，这里简单用 modal prompt 模拟，或者先只做入口)
  showRenameModal(id, oldTitle) {
    // 小程序原生没有带输入框的 modal，这里暂时跳转编辑页修改标题，或者忽略
    wx.navigateTo({
        url: `/pages/index/index?id=${id}`
    });
    wx.showToast({ title: '请在顶部修改标题', icon: 'none' });
  },

  onProjectLongPress(e) {
    if (this.data.isSelectMode) return;
    const { id } = e.currentTarget.dataset;
    wx.vibrateShort({ type: 'medium' });
    this.setData({ isSelectMode: true });
    this.toggleSelect(id);
  },

  toggleSelect(id) {
    const selectedIds = { ...this.data.selectedIds };
    if (selectedIds[id]) {
      delete selectedIds[id];
    } else {
      selectedIds[id] = true;
    }

    const selectedCount = Object.keys(selectedIds).length;
    this.setData({ 
      selectedIds, 
      selectedCount,
      isSelectMode: selectedCount > 0
    });
  },

  onCancelSelect() {
    this.setData({
      isSelectMode: false,
      selectedIds: {},
      selectedCount: 0
    });
  },

  onGoToEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/index/index?id=${id}`
    });
  },

  onGoToPreview(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/preview/preview?id=${id}`
    });
  },

  onDelete(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除稿件',
      content: '确定要永久删除这篇稿件吗？',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          Storage.deleteProject(id);
          this.loadProjects();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  },

  onBatchDelete() {
    const ids = Object.keys(this.data.selectedIds);
    wx.showModal({
      title: '批量删除',
      content: `确定要删除这 ${ids.length} 篇稿件吗？`,
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          ids.forEach(id => Storage.deleteProject(id));
          this.onCancelSelect();
          this.loadProjects();
          wx.showToast({ title: '已批量删除', icon: 'none' });
        }
      }
    });
  }
});

