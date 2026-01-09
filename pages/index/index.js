const Storage = require('../../utils/storage');
const AiService = require('../../utils/ai');

const CARD_TYPES = [
  { type: 'opening', label: '开场', defaultTitle: '开场钩子', intent: '吸引注意力，建立连接', placeholder: '试试用一个反直觉的问题或一个震撼的场景开始...' },
  { type: 'background', label: '背景', defaultTitle: '困境与起因', intent: '交代时空，引入问题', placeholder: '简要交代背景，让听众知道你在什么时候、什么地方遇到了什么...' },
  { type: 'conflict', label: '冲突', defaultTitle: '关键冲突', intent: '制造张力，升级压力', placeholder: '描述最难的时刻，你是如何被推向极限的？AI 是如何让你感到无力的？' },
  { type: 'turning_point', label: '转折', defaultTitle: '转折点', intent: '寻找转机，改变视角', placeholder: '你是如何发现新的方法或视角的？第一次成功的尝试是什么？' },
  { type: 'insight', label: '洞见', defaultTitle: '感悟与金句', intent: '提炼价值，升华主题', placeholder: '从这段经历中你学到了什么？能不能用一句深刻的话总结它？' },
  { type: 'case', label: '案例', defaultTitle: '案例分享', intent: '支撑观点，增加可信度', placeholder: '给出一个具体的例子或细节，来证明你的洞见或方法是有效的...' },
  { type: 'ending', label: '结尾', defaultTitle: '结尾回扣', intent: '呼应开头，强化领悟', placeholder: '回扣开头的悬念，总结你的成长。让听众感受到完整性。' },
  { type: 'cta', label: 'CTA', defaultTitle: '行动号召', intent: '指明方向，号召行动', placeholder: '你希望听众听完后立刻去做的一个具体动作是什么？' },
  { type: 'transition', label: '过渡', defaultTitle: '承上启下', intent: '衔接逻辑，平滑过渡', placeholder: '简单的一两句话，连接前后的两个积木模块...' }
];

Page({
  data: {
    project: null,
    cards: [],
    totalDurationStr: '00:00',
    cardTypes: CARD_TYPES,
    typeIndexMap: {},
    activeCardId: null,
    showAiMenu: false,
    aiTargetCardId: null,
    
    // AI 协作看板
    suggestions: [],
    showAiHub: true,

    // 拖拽相关
    isDragging: false,
    draggingId: null,
    dragTop: 0,
    dragTargetIndex: -1,
    dragInsertPosition: 'after', // before/after
    cardWidth: 0,
    startY: 0,
    itemHeight: 0,
    scrollY: 0,
    scrollLock: false
  },

  onScroll(e) {
    if (!this.data.isDragging) {
      this.setData({ scrollY: e.detail.scrollTop });
    }
  },

  onLoad(options) {
    let projectId = options.id;
    if (!projectId) {
      // 如果没有 ID，获取最近一个或者创建一个
      const projects = Storage.getProjects();
      if (projects.length > 0) {
        projectId = projects[0].id;
      } else {
        projectId = Storage.createProject();
      }
    }
    this.loadProject(projectId);

    // 初始化类型索引映射
    const typeIndexMap = {};
    CARD_TYPES.forEach((item, index) => {
      typeIndexMap[item.type] = index;
    });
    this.setData({ typeIndexMap });
  },

  loadProject(id) {
    const projectData = Storage.getProject(id);
    const projects = Storage.getProjects();
    const projectMeta = projects.find(p => p.id === id);

    if (projectData) {
      const cards = projectData.cards.map(card => {
        const typeInfo = CARD_TYPES.find(t => t.type === card.type) || CARD_TYPES[4];
        return {
          ...card,
          typeLabel: typeInfo.label,
          intent: typeInfo.intent,
          placeholder: typeInfo.placeholder
        };
      });
      this.setData({
        project: projectMeta,
        cards
      }, () => {
        this.calculateTotalDuration();
      });
    }
  },

  calculateTotalDuration() {
    const totalSec = this.data.cards.reduce((sum, card) => sum + (card.durationSec || 0), 0);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const totalDurationStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    this.setData({ totalDurationStr });
  },

  onTitleChange(e) {
    const title = e.detail.value;
    const project = this.data.project;
    project.title = title;
    this.setData({ project });
    Storage.saveProjectMeta(project);
  },

  onContentChange(e) {
    const { id } = e.currentTarget.dataset;
    const content = e.detail.value;
    const cards = this.data.cards;
    const card = cards.find(c => c.id === id);
    if (card) {
      card.content = content;
      // 用户手动修改，清除 AI 标识
      if (card.isAi) {
        card.isAi = false;
      }
      this.setData({ cards });
      this.saveCards();
    }
  },

  onConfirmAi(e) {
    const { id } = e.currentTarget.dataset;
    const cards = this.data.cards;
    const card = cards.find(c => c.id === id);
    if (card) {
      card.isAi = false;
      this.setData({ cards });
      this.saveCards();
      wx.vibrateShort({ type: 'light' });
    }
  },

  onMoveUp(e) {
    const { index } = e.currentTarget.dataset;
    if (index === 0) return;
    const cards = [...this.data.cards];
    const item = cards.splice(index, 1)[0];
    cards.splice(index - 1, 0, item);
    this.setData({ cards, activeCardId: item.id });
    this.saveCards();
    wx.vibrateShort({ type: 'light' });
  },

  onMoveDown(e) {
    const { index } = e.currentTarget.dataset;
    if (index === this.data.cards.length - 1) return;
    const cards = [...this.data.cards];
    const item = cards.splice(index, 1)[0];
    cards.splice(index + 1, 0, item);
    this.setData({ cards, activeCardId: item.id });
    this.saveCards();
    wx.vibrateShort({ type: 'light' });
  },

  onTypeChange(e) {
    const { id } = e.currentTarget.dataset;
    const index = e.detail.value;
    const newType = CARD_TYPES[index];
    const cards = this.data.cards;
    const card = cards.find(c => c.id === id);
    if (card) {
      card.type = newType.type;
      card.typeLabel = newType.label;
      card.intent = newType.intent;
      card.placeholder = newType.placeholder;
      // 如果标题是默认的，自动更新标题
      const isDefaultTitle = CARD_TYPES.some(t => t.defaultTitle === card.title);
      if (isDefaultTitle || !card.title) {
        card.title = newType.defaultTitle;
      }
      this.setData({ cards });
      this.saveCards();
    }
  },

  saveCards() {
    Storage.saveProjectData(this.data.project.id, { cards: this.data.cards });
  },

  onAddNewCard() {
    const defaultType = CARD_TYPES[4]; // insight
    const newCard = {
      id: Date.now().toString(),
      type: defaultType.type,
      title: defaultType.defaultTitle,
      typeLabel: defaultType.label,
      intent: defaultType.intent,
      placeholder: defaultType.placeholder,
      content: '',
      durationSec: 20,
      quotes: []
    };
    const cards = [...this.data.cards, newCard];
    this.setData({ cards }, () => {
      this.calculateTotalDuration();
      this.saveCards();
    });
  },

  onAddAfter(e) {
    const { id } = e.currentTarget.dataset;
    const index = this.data.cards.findIndex(c => c.id === id);
    const defaultType = CARD_TYPES[4]; // insight
    const newCard = {
      id: Date.now().toString(),
      type: defaultType.type,
      title: defaultType.defaultTitle,
      typeLabel: defaultType.label,
      intent: defaultType.intent,
      placeholder: defaultType.placeholder,
      content: '',
      durationSec: 20,
      quotes: []
    };
    const cards = [...this.data.cards];
    cards.splice(index + 1, 0, newCard);
    this.setData({ cards }, () => {
      this.calculateTotalDuration();
      this.saveCards();
    });
  },

  onDeleteCard(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这张积木吗？',
      success: (res) => {
        if (res.confirm) {
          const cards = this.data.cards.filter(c => c.id !== id);
          this.setData({ cards }, () => {
            this.calculateTotalDuration();
            this.saveCards();
          });
        }
      }
    });
  },

  onAiAction(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({
      showAiMenu: true,
      aiTargetCardId: id
    });
  },

  hideAiMenu() {
    this.setData({ showAiMenu: false });
  },

  async doAiAction(e) {
    const action = e.currentTarget.dataset.action;
    const cardId = this.data.aiTargetCardId;
    this.hideAiMenu();

    const card = this.data.cards.find(c => c.id === cardId);
    if (!card) return;

    wx.showLoading({ title: 'AI 思考中...' });
    try {
      if (action === 'quote') {
        const quotes = await AiService.generateQuotes(card);
        card.quotes = [
          ...card.quotes,
          ...quotes.map(q => ({ text: q, pinned: false }))
        ];
      } else {
        const result = await AiService.refineCard(action, card, this.data.project.title);
        card.content = result;
        card.isAi = true; // 标记为 AI 生成
      }
      
      this.setData({ cards: this.data.cards });
      this.saveCards();
      wx.hideLoading();
      wx.showToast({ title: '已完成优化', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showModal({
        title: 'AI 优化失败',
        content: err.message || '请检查网络或 API Key 配置',
        showCancel: false
      });
    }
  },

  async onAiComplete() {
    wx.showLoading({ title: '分析结构中...' });
    try {
      const result = await AiService.analyzeStructure(this.data.cards, this.data.project.title);
      wx.hideLoading();
      
      // 将 AI 建议转化为 Todo List
      const lines = result.split('\n').filter(l => l.trim().length > 5);
      const newSuggestions = lines.slice(0, 3).map((text, i) => ({
        id: Date.now() + i,
        text: text.replace(/^\d\.\s*/, ''),
        btnText: text.includes('CTA') || text.includes('结尾') ? '去补齐' : '去优化'
      }));

      this.setData({ 
        suggestions: [...this.data.suggestions, ...newSuggestions],
        showAiHub: true
      });

      wx.showToast({ title: '已更新协作建议', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showModal({
        title: '分析失败',
        content: err.message,
        showCancel: false
      });
    }
  },

  toggleAiHub() {
    this.setData({ showAiHub: !this.data.showAiHub });
  },

  onIgnoreSuggestion(e) {
    const { id } = e.currentTarget.dataset;
    const suggestions = this.data.suggestions.filter(s => s.id !== id);
    this.setData({ suggestions });
  },

  onProcessSuggestion(e) {
    const { id } = e.currentTarget.dataset;
    const suggestion = this.data.suggestions.find(s => s.id === id);
    
    // 简单的联动：如果包含特定关键词，执行操作
    if (suggestion.text.includes('CTA')) {
      this.onAddNewCard(); // 简单示例：直接加个新卡
    }
    
    // 处理后移除
    this.onIgnoreSuggestion(e);
    wx.showToast({ title: '请开始创作', icon: 'none' });
  },

  onGoToPreview() {
    wx.navigateTo({
      url: `/pages/preview/preview?id=${this.data.project.id}`
    });
  },

  onGoHome() {
    wx.reLaunch({
      url: '/pages/history/history'
    });
  },

  // 拖拽排序逻辑
  onCardTouchStart(e) {
    const { id, index } = e.currentTarget.dataset;
    this.touchStartTime = Date.now();
    this.startY = e.touches[0].pageY;
    
    this.longPressTimer = setTimeout(() => {
      // 触发长按
      wx.vibrateShort({ type: 'medium' });
      
      const query = wx.createSelectorQuery();
      query.select('.card-wrapper').boundingClientRect(res => {
        this.setData({
          isDragging: true,
          draggingId: id,
          dragTop: e.touches[0].pageY - 40, 
          dragTopOrigin: e.touches[0].pageY - 40,
          cardWidth: res.width,
          dragTargetIndex: index,
          scrollLock: true // 锁定滚动
        });
      }).exec();
    }, 500);
  },

  onCardTouchMove(e) {
    if (!this.data.isDragging) {
      if (Math.abs(e.touches[0].pageY - this.startY) > 10) {
        clearTimeout(this.longPressTimer);
      }
      return;
    }

    const currentY = e.touches[0].pageY;
    const dragTop = currentY - 40; // 随手指移动
    
    // 更加精确的占位算法
    // 假设卡片平均高度（含边距）为 140px (由 CSS 决定)
    const cardHeightWithMargin = 140; 
    const relativeY = currentY + this.data.scrollY - 100; // 减去 header 高度
    const newTargetIndex = Math.max(0, Math.min(this.data.cards.length - 1, Math.floor(relativeY / cardHeightWithMargin)));

    if (newTargetIndex !== this.data.dragTargetIndex) {
      wx.vibrateShort({ type: 'light' });
      this.setData({
        dragTargetIndex: newTargetIndex
      });
    }

    this.setData({
      dragTop
    });
  },

  onCardTouchEnd(e) {
    clearTimeout(this.longPressTimer);
    if (!this.data.isDragging) return;

    const { draggingId, dragTargetIndex } = this.data;
    const cards = [...this.data.cards];
    const fromIndex = cards.findIndex(c => c.id === draggingId);
    
    if (fromIndex !== dragTargetIndex) {
      const [movedCard] = cards.splice(fromIndex, 1);
      cards.splice(dragTargetIndex, 0, movedCard);
      this.setData({ 
        cards,
        activeCardId: draggingId // 保持选中态
      }, () => {
        this.saveCards();
      });
    }

    this.setData({
      isDragging: false,
      draggingId: null,
      dragTargetIndex: -1,
      scrollLock: false // 解锁滚动
    });
    wx.vibrateShort({ type: 'medium' });
  },

  onCardTap(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ activeCardId: id });
  }
});

