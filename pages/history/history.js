const Storage = require('../../utils/storage');

Page({
  data: {
    projects: [],
    filteredProjects: [],
    searchText: '',
    isSelectMode: false,
    selectedIds: {},
    selectedCount: 0
  },

  onShow() {
    this.loadProjects();
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
        typeLabel: p.type === 'toastmasters_story' ? '头马' : '职场'
      };
    }).sort((a, b) => b.updatedAt - a.updatedAt);

    this.setData({ projects }, () => {
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
    const id = Storage.createProject();
    wx.navigateTo({
      url: `/pages/index/index?id=${id}`
    });
  },

  onProjectTap(e) {
    const { id } = e.currentTarget.dataset;
    if (this.data.isSelectMode) {
      this.toggleSelect(id);
    } else {
      this.onGoToEdit(e);
    }
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

