const PROJECTS_KEY = 'projects';
const LIBRARY_CASES_KEY = 'library_cases';
const LIBRARY_FRAGMENTS_KEY = 'library_fragments';

const Storage = {
  // --- 核心项目相关 ---

  // 获取所有项目
  getProjects() {
    return wx.getStorageSync(PROJECTS_KEY) || [];
  },

  // 获取特定项目及其卡片
  getProject(id) {
    return wx.getStorageSync(`project_${id}`);
  },

  // 保存或更新项目元数据
  saveProjectMeta(project) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index > -1) {
      projects[index] = { ...projects[index], ...project, updatedAt: Date.now() };
    } else {
      projects.push({ ...project, createdAt: Date.now(), updatedAt: Date.now() });
    }
    wx.setStorageSync(PROJECTS_KEY, projects);
  },

  // 保存项目详细数据（卡片列表及导师建议）
  saveProjectData(id, data) {
    const cards = data.cards || [];
    const totalDurationSec = cards.reduce((sum, c) => sum + (c.durationSec || 0), 0);
    // 计算总字数
    const totalWordCount = cards.reduce((sum, c) => sum + (c.content ? c.content.length : 0), 0);
    
    const hasUnconfirmedAi = cards.some(c => c.isAi);
    const progress = cards.filter(c => c.content).length / (cards.length || 1);
    
    // 导师建议相关的元数据
    const suggestions = data.mentorSuggestions || [];
    const pendingSuggestionCount = suggestions.filter(s => s.status === 'pending').length;

    wx.setStorageSync(`project_${id}`, {
      ...data,
      updatedAt: Date.now()
    });
    
    // 更新元数据
    this.saveProjectMeta({ 
      id, 
      cardCount: cards.length,
      totalWordCount, // 保存字数
      totalDurationSec,
      hasUnconfirmedAi,
      progress,
      pendingSuggestionCount
    });
  },

  // 创建新项目
  createProject(title = '未命名演讲') {
    const id = Date.now().toString();
    const newProject = {
      id,
      title,
      type: 'toastmasters_story', // 默认头马故事
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const initialData = {
      cards: [
        {
          id: Date.now().toString() + '_1',
          type: 'opening',
          title: '开场钩子',
          content: '',
          durationSec: 0,
          quotes: []
        }
      ]
    };

    this.saveProjectMeta(newProject);
    this.saveProjectData(id, initialData);
    return id;
  },

  // 删除项目
  deleteProject(id) {
    const projects = this.getProjects().filter(p => p.id !== id);
    wx.setStorageSync(PROJECTS_KEY, projects);
    wx.removeStorageSync(`project_${id}`);
  },

  // --- 素材库相关 ---

  // 获取所有案例
  getCases() {
    return wx.getStorageSync(LIBRARY_CASES_KEY) || [];
  },

  // 保存案例 (新增/更新)
  saveCase(item) {
    const list = this.getCases();
    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) {
      list[index] = { ...list[index], ...item, updatedAt: Date.now() };
    } else {
      list.unshift({ ...item, id: item.id || Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() });
    }
    wx.setStorageSync(LIBRARY_CASES_KEY, list);
  },

  // 删除案例
  deleteCase(id) {
    const list = this.getCases().filter(i => i.id !== id);
    wx.setStorageSync(LIBRARY_CASES_KEY, list);
  },

  // 获取所有碎片
  getFragments() {
    return wx.getStorageSync(LIBRARY_FRAGMENTS_KEY) || [];
  },

  // 保存碎片 (新增/更新)
  saveFragment(item) {
    const list = this.getFragments();
    const index = list.findIndex(i => i.id === item.id);
    if (index > -1) {
      list[index] = { ...list[index], ...item, updatedAt: Date.now() };
    } else {
      list.unshift({ ...item, id: item.id || Date.now().toString(), createdAt: Date.now(), updatedAt: Date.now() });
    }
    wx.setStorageSync(LIBRARY_FRAGMENTS_KEY, list);
  },

  // 删除碎片
  deleteFragment(id) {
    const list = this.getFragments().filter(i => i.id !== id);
    wx.setStorageSync(LIBRARY_FRAGMENTS_KEY, list);
  }
};

module.exports = Storage;

