const AiService = require('../../utils/ai');
const Storage = require('../../utils/storage');
const { TEMPLATES, getTemplate } = require('../../utils/templates');

Page({
  data: {
    currentStep: 1,
    
    // Step 1 Data
    fragments: [''],
    hasContent: false,

    // Step 2 Data
    goal: '',
    audience: '',
    isRecommending: false,

    // Step 3 Data
    allTemplates: TEMPLATES,
    recommendations: [],
    recMap: {}, // 用于快速判断是否推荐
    selectedTemplateId: '',
    templateMap: {}, // id -> template obj

    // Generating State
    isGenerating: false,
    generateProgress: 0,
    generatingStatus: ''
  },

  onLoad(options) {
    // 建立模版 ID 映射
    const map = {};
    TEMPLATES.forEach(t => map[t.id] = t);
    this.setData({ templateMap: map });

    // 优先检查 Storage (处理大文本)
    const storageContent = wx.getStorageSync('wizard_init_content');
    if (storageContent) {
      this.setData({
        fragments: [storageContent],
        hasContent: true
      });
      // 消费后清除，防止下次误读
      wx.removeStorageSync('wizard_init_content');
    } 
    // 兼容 URL 参数
    else if (options.initialFragment) {
      const content = decodeURIComponent(options.initialFragment);
      this.setData({
        fragments: [content],
        hasContent: true
      });
    }
  },

  // --- Step 1 Logic ---

  onFragmentInput(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const fragments = [...this.data.fragments];
    fragments[index] = value;
    
    // 检查是否有实质内容
    const hasContent = fragments.some(f => f.trim().length > 0);
    
    this.setData({ fragments, hasContent });
  },

  onAddFragment() {
    const fragments = [...this.data.fragments, ''];
    this.setData({ fragments });
  },

  onDeleteFragment(e) {
    const { index } = e.currentTarget.dataset;
    const fragments = [...this.data.fragments];
    fragments.splice(index, 1);
    
    const hasContent = fragments.some(f => f.trim().length > 0);
    this.setData({ fragments, hasContent });
  },

  onNextStep() {
    if (this.data.currentStep === 1) {
      if (!this.data.hasContent) return;
      // 清理空碎片
      const validFragments = this.data.fragments.filter(f => f.trim().length > 0);
      this.setData({ 
        currentStep: 2,
        fragments: validFragments
      });
    } else if (this.data.currentStep === 2) {
      // 这里的逻辑主要在 onRecommendTemplate 处理
    }
  },

  onPrevStep() {
    if (this.data.currentStep > 1) {
      this.setData({ currentStep: this.data.currentStep - 1 });
    }
  },

  // --- Step 2 Logic ---

  onGoalInput(e) {
    this.setData({ goal: e.detail.value });
  },

  onAudienceInput(e) {
    this.setData({ audience: e.detail.value });
  },

  async onRecommendTemplate() {
    if (!this.data.goal || !this.data.audience) {
      wx.showToast({ title: '请填写目标和听众', icon: 'none' });
      return;
    }

    this.setData({ isRecommending: true });
    
    try {
      const res = await AiService.recommendTemplate(
        this.data.goal, 
        this.data.audience, 
        this.data.fragments
      );
      
      const recs = res.recommendations || [];
      const recMap = {};
      recs.forEach(r => recMap[r.templateId] = true);

      // 默认选中第一个推荐
      const defaultSelect = recs.length > 0 ? recs[0].templateId : 'scqa';

      this.setData({
        recommendations: recs,
        recMap,
        selectedTemplateId: defaultSelect,
        currentStep: 3,
        isRecommending: false
      });

    } catch (err) {
      console.error(err);
      wx.showToast({ title: '分析失败，请重试', icon: 'none' });
      this.setData({ isRecommending: false });
    }
  },

  // --- Step 3 Logic ---

  onSelectTemplate(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedTemplateId: id });
  },

  async onStartGenerate() {
    if (this.data.isGenerating) return;

    this.setData({ 
      isGenerating: true, 
      generateProgress: 10,
      generatingStatus: '正在初始化结构...' 
    });

    try {
      // 1. 获取模版结构
      const template = getTemplate(this.data.selectedTemplateId);
      
      // 2. 创建新项目
      const projectTitle = this.data.goal.length > 10 ? this.data.goal.substring(0, 10) + '...' : this.data.goal;
      const projectId = Storage.createProject(projectTitle);
      
      // 更新项目元数据（标记来源）
      const projectMeta = Storage.getProject(projectId); // 这里实际上读取的是 meta 列表的逻辑有问题，createProject 返回 id，我们需要 saveProjectMeta
      // 由于 Storage.createProject 内部已经保存了 meta 和 data，我们这里重新 update 一下
      // 更好的方式是在 createProject 支持传参，或者 updateProject
      // 这里简单处理：读取出来 -> 修改 -> 保存
      
      // 3. 开始 AI 生成
      this.setData({ generateProgress: 30, generatingStatus: 'AI 正在填充内容...' });
      
      const generatedParts = await AiService.generateProject(
        template,
        this.data.goal,
        this.data.audience,
        this.data.fragments,
        (text) => {
           // 这里是流式全文本，暂时没地方展示，可以打印日志
           // 或者做一个更高级的进度条
           if (text.length % 50 === 0) {
              const p = Math.min(90, 30 + Math.floor(text.length / 20));
              this.setData({ generateProgress: p });
           }
        }
      );

      // 4. 组装 Cards
      const cards = template.structure.map((step, index) => {
        const part = generatedParts.find(p => p.index === index);
        return {
          id: projectId + '_' + index,
          type: step.type,
          title: step.title,
          typeLabel: step.title.split(' ')[0], // 简化显示
          intent: step.intent,
          content: part ? part.content : '', // 填入生成内容
          durationSec: 0,
          quotes: []
        };
      });

      // 5. 保存数据
      Storage.saveProjectData(projectId, { cards });
      
      // 更新元数据统计
      const totalDurationSec = cards.reduce((sum, c) => {
         const charCount = (c.content || '').length;
         return sum + (charCount > 0 ? Math.ceil(charCount / 2.5) : 0);
      }, 0);

      Storage.saveProjectMeta({
        id: projectId,
        cardCount: cards.length,
        totalDurationSec,
        progress: 1, // 已完成
        hasUnconfirmedAi: false
      });

      this.setData({ generateProgress: 100, generatingStatus: '完成！即将跳转...' });

      // 6. 跳转
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/index/index?id=${projectId}`
        });
      }, 800);

    } catch (err) {
      console.error(err);
      wx.showModal({
        title: '生成失败',
        content: err.message || 'AI 响应异常',
        showCancel: false
      });
      this.setData({ isGenerating: false });
    }
  }
});