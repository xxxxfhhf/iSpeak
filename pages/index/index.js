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
  { type: 'cta', label: '号召', defaultTitle: '行动号召', intent: '指明方向，号召行动', placeholder: '你希望听众听完后立刻去做的一个具体动作是什么？' },
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
    
    // AI 导师建议
    pendingSuggestionCount: 0,
    isMentorThinking: false,
    showMentorThinkingMask: false, // 是否显示流式阅卷弹窗
    mentorThinkingText: '',
    mentorSuggestions: [],
    currentSuggestionIndex: 0,
    showFloatingMentor: true,

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

  onShareAppMessage() {
    return {
      title: this.data.project ? this.data.project.title : 'AI 演讲积木',
      path: `/pages/index/index?id=${this.data.project ? this.data.project.id : ''}`
    };
  },

  onShareTimeline() {
    return {
      title: this.data.project ? this.data.project.title : 'AI 演讲积木'
    };
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

      const suggestions = projectData.mentorSuggestions || [];
      const pendingSuggestions = suggestions.filter(s => s.status === 'pending');
      const pendingSuggestionCount = pendingSuggestions.length;

      this.setData({
        project: projectMeta,
        learnSource: projectData.learnSource || null,
        cards,
        mentorSuggestions: pendingSuggestions,
        pendingSuggestionCount,
        currentSuggestionIndex: 0
      }, () => {
        this.calculateTotalDuration();
      });
    }
  },

  calculateTotalDuration() {
    const totalSec = this.data.cards.reduce((sum, card) => {
      // 实时计算每张卡片的时长：150字/分钟 = 2.5字/秒
      const content = card.content || '';
      const charCount = content.trim().length;
      // 基础时间 3s (即使没字也要预留停顿时间)，每 2.5 个字增加 1s
      const duration = charCount > 0 ? Math.ceil(charCount / 2.5) : 0;
      card.durationSec = duration;
      card.wordCount = charCount; // 记录字数
      return sum + duration;
    }, 0);

    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const totalDurationStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    this.setData({ 
      cards: this.data.cards,
      totalDurationStr 
    });
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
      this.calculateTotalDuration();
      this.saveCards();
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
      durationSec: 0,
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
      durationSec: 0,
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
    // 从菜单项获取操作类型：fill(填充)、oral(口语化)、vivid(画面感)、brief(精简)、quote(生成金句)
    const action = e.currentTarget.dataset.action;
    // 获取之前通过 onAiAction 设置的目标卡片 ID
    const cardId = this.data.aiTargetCardId;
    // 关闭 AI 菜单弹窗
    this.hideAiMenu();

    // 在卡片列表中查找目标卡片
    const card = this.data.cards.find(c => c.id === cardId);
    // 如果卡片不存在，直接返回（防止异常情况）
    if (!card) return;

    // 显示加载提示，告知用户 AI 正在处理
    wx.showLoading({ title: 'AI 思考中...' });
    try {
      // 分支处理：金句生成与其他优化操作使用不同的处理逻辑
      if (action === 'quote') {
        // 金句生成：调用 AI 服务生成多条金句
        const quotes = await AiService.generateQuotes(card);
        // 将新生成的金句追加到现有金句列表
        card.quotes = [
          ...card.quotes,
          ...quotes.map(q => ({ 
            text: q.text, 
            type: q.type, 
            source: q.source, 
            pinned: false 
          }))
        ];
      } else {
        // 其他优化操作（fill/oral/vivid/brief）：流式生成优化内容，但不立即覆盖原文
        // 使用 tempAiContent 存储 AI 生成的临时内容，供用户预览对比
        await AiService.refineCard(action, card, this.data.project.title, (text) => {
          // 实时更新临时 AI 内容（流式文本累积）
          card.tempAiContent = text;
          // 触发视图更新，让用户看到实时生成的预览内容
          this.setData({ cards: this.data.cards });
        });
        // 标记卡片正在进行 AI 协作状态
        card.isAi = true;
      }
      
      // 最终更新数据
      this.setData({ cards: this.data.cards });
      // 保存金句变动（如果是 quote 模式）
      if (action === 'quote') this.saveCards();
      
      wx.hideLoading();
      wx.showToast({ title: action === 'quote' ? '金句已生成' : 'AI 优化已就绪', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      wx.showModal({
        title: 'AI 优化失败',
        content: err.message || '请检查网络或配置',
        showCancel: false
      });
    }
  },

  /**
   * AI 结果处理：替换原文
   */
  onAiAcceptReplace(e) {
    const { id } = e.currentTarget.dataset;
    const cards = this.data.cards;
    const card = cards.find(c => c.id === id);
    if (card && card.tempAiContent) {
      card.content = card.tempAiContent; // 覆盖原文
      card.tempAiContent = null;         // 清空临时内容
      card.isAi = false;                 // 退出 AI 协作状态
      this.setData({ cards });
      this.calculateTotalDuration();
      this.saveCards();
      wx.vibrateShort({ type: 'medium' });
      wx.showToast({ title: '已替换原文', icon: 'none' });
    }
  },

  /**
   * AI 结果处理：插入后行
   */
  onAiAcceptInsert(e) {
    const { id } = e.currentTarget.dataset;
    const index = this.data.cards.findIndex(c => c.id === id);
    const card = this.data.cards[index];
    
    if (card && card.tempAiContent) {
      // 创建新卡片，继承原卡片的部分属性（如类型），但使用 AI 生成的内容
      const newCard = {
        ...card,
        id: Date.now().toString(),
        content: card.tempAiContent,
        tempAiContent: null,
        isAi: false,
        quotes: [] // 新卡片初始不携带原卡片的金句
      };
      
      const cards = [...this.data.cards];
      cards.splice(index + 1, 0, newCard); // 在当前卡片后插入
      
      // 原卡片恢复原状（退出 AI 状态）
      card.tempAiContent = null;
      card.isAi = false;
      
      this.setData({ cards }, () => {
        this.calculateTotalDuration();
        this.saveCards();
      });
      wx.vibrateShort({ type: 'medium' });
      wx.showToast({ title: '已作为新积木插入', icon: 'none' });
    }
  },

  /**
   * AI 结果处理：放弃修改
   */
  onAiDiscard(e) {
    const { id } = e.currentTarget.dataset;
    const cards = this.data.cards;
    const card = cards.find(c => c.id === id);
    if (card) {
      card.tempAiContent = null;
      card.isAi = false;
      this.setData({ cards });
      wx.vibrateShort({ type: 'light' });
    }
  },

  /**
   * 点击金句：弹出操作菜单（插入/复制/删除）
   */
  onQuoteTap(e) {
    const { text, cardId, index } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['插入到正文末尾', '复制到剪贴板', '删除该金句'],
      itemColor: '#000000',
      success: (res) => {
        if (res.tapIndex === 0) {
          // 插入到正文
          const cards = this.data.cards;
          const card = cards.find(c => c.id === cardId);
          if (card) {
            const separator = card.content ? '\n\n' : '';
            card.content += separator + text;
            this.setData({ cards });
            this.calculateTotalDuration();
            this.saveCards();
            wx.showToast({ title: '已插入', icon: 'none' });
          }
        } else if (res.tapIndex === 1) {
          // 复制
          wx.setClipboardData({
            data: text,
            success: () => {
              wx.showToast({ title: '已复制', icon: 'success' });
            }
          });
        } else if (res.tapIndex === 2) {
          // 删除
          const cards = this.data.cards;
          const card = cards.find(c => c.id === cardId);
          if (card && card.quotes) {
            card.quotes.splice(index, 1);
            this.setData({ cards });
            this.saveCards();
            wx.showToast({ title: '已删除', icon: 'none' });
          }
        }
      }
    });
  },

  async onConsultMentor() {
    if (this.data.isMentorThinking) {
      wx.showToast({ title: '导师正在阅卷中...', icon: 'none' });
      return;
    }

    this.setData({ 
      isMentorThinking: true,
      mentorThinkingText: '导师正在阅读您的稿件...' 
    });

    // 震动提醒开始后台任务
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: '已开启后台阅卷', icon: 'none' });

    try {
      const result = await AiService.analyzeStructure(this.data.cards, this.data.project.title, (text) => {
        // 在后台静默更新文本，不阻塞用户
        this.setData({ mentorThinkingText: text });
      });
      
      // 精准解析：匹配 "建议X：标题" 和 "内容：指导"
      const sections = result.split(/建议\d：|建议\d:/).filter(s => s.trim().length > 10);
      
      const newItems = sections.map((section, i) => {
        const lines = section.trim().split('\n');
        const title = lines[0].replace(/\[|\]/g, '').trim();
        const content = lines.slice(1).join('\n').replace(/内容：|内容:/, '').trim();
        
        return {
          id: Date.now() + i,
          title: title || '精进建议',
          text: content,
          status: 'pending'
        };
      });

      const projectData = Storage.getProject(this.data.project.id);
      const allSuggestions = [...(projectData.mentorSuggestions || []), ...newItems];
      projectData.mentorSuggestions = allSuggestions;
      Storage.saveProjectData(this.data.project.id, projectData);
      
      const pendingSuggestions = allSuggestions.filter(s => s.status === 'pending');
      this.setData({ 
        isMentorThinking: false,
        showMentorThinkingMask: false, // 阅卷完成自动关闭详情窗
        mentorThinkingText: '',
        mentorSuggestions: pendingSuggestions,
        pendingSuggestionCount: pendingSuggestions.length,
        currentSuggestionIndex: 0, 
        showFloatingMentor: true   // 任务完成，自动展开悬浮窗提醒用户
      });

      wx.vibrateLong(); // 强震动提醒完成
      wx.showToast({ title: `导师已完成阅卷，新增 ${newItems.length} 条建议`, icon: 'none', duration: 3000 });

    } catch (err) {
      this.setData({ isMentorThinking: false, mentorThinkingText: '' });
      wx.showToast({ title: '咨询失败，请重试', icon: 'none' });
    }
  },

  onGoToMentor() {
    wx.navigateTo({
      url: `/pages/mentor/mentor?id=${this.data.project.id}`
    });
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

  /**
   * 切换悬浮导师卡片的显示/隐藏
   */
  toggleFloatingMentor() {
    this.setData({
      showFloatingMentor: !this.data.showFloatingMentor
    });
  },

  /**
   * 切换到上一条建议
   */
  prevSuggestion() {
    if (this.data.currentSuggestionIndex > 0) {
      this.setData({
        currentSuggestionIndex: this.data.currentSuggestionIndex - 1
      });
    }
  },

  /**
   * 切换到下一条建议
   */
  nextSuggestion() {
    if (this.data.currentSuggestionIndex < this.data.mentorSuggestions.length - 1) {
      this.setData({
        currentSuggestionIndex: this.data.currentSuggestionIndex + 1
      });
    }
  },

  /**
   * 标记当前建议为已完成
   */
  async completeSuggestion() {
    const { mentorSuggestions, currentSuggestionIndex, project } = this.data;
    const suggestion = mentorSuggestions[currentSuggestionIndex];
    if (!suggestion) return;

    // 更新本地存储中的状态
    const projectData = Storage.getProject(project.id);
    if (projectData && projectData.mentorSuggestions) {
      const idx = projectData.mentorSuggestions.findIndex(s => s.id === suggestion.id);
      if (idx !== -1) {
        projectData.mentorSuggestions[idx].status = 'completed';
        Storage.saveProjectData(project.id, projectData);
      }
    }

    // 更新当前页面的状态
    const newSuggestions = mentorSuggestions.filter(s => s.id !== suggestion.id);
    let newIndex = currentSuggestionIndex;
    if (newIndex >= newSuggestions.length) {
      newIndex = Math.max(0, newSuggestions.length - 1);
    }

    this.setData({
      mentorSuggestions: newSuggestions,
      pendingSuggestionCount: newSuggestions.length,
      currentSuggestionIndex: newIndex
    });

    wx.showToast({ title: '建议已完成', icon: 'success' });
  },

  /**
   * 显示后台阅卷详情
   */
  onShowMentorThinking() {
    this.setData({ showMentorThinkingMask: true });
  },

  /**
   * 隐藏后台阅卷详情
   */
  onHideMentorThinking() {
    this.setData({ showMentorThinkingMask: false });
  },

  preventBubble() {
    // 阻止冒泡
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

