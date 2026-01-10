const PROJECTS_KEY = 'projects';

const Storage = {
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
          durationSec: 20,
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
  }
};

module.exports = Storage;

