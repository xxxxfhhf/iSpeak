/**
 * 演讲结构模版定义
 * Tags: 'work'(职场汇报), 'story'(故事演讲), 'comm'(即兴沟通)
 */

const TEMPLATES = [
  // --- 职场汇报类 ---
  {
    id: 'scqa',
    name: 'SCQA 职场汇报',
    description: '麦肯锡经典架构，通过"情境-冲突-问题-答案"快速抓住注意力。',
    category: 'work',
    tags: ['汇报', '方案', '晋升'],
    structure: [
      { type: 'background', title: '情境 (Situation)', intent: '描述大家都认可的现状或背景' },
      { type: 'conflict', title: '冲突 (Complication)', intent: '指出当前面临的问题、挑战或变化' },
      { type: 'insight', title: '疑问 (Question)', intent: '明确我们需要解决的核心问题' },
      { type: 'solution', title: '答案 (Answer)', intent: '提出我们的解决方案或核心观点' },
      { type: 'cta', title: '行动 (Action)', intent: '希望听众下一步做什么' }
    ]
  },
  {
    id: 'ops',
    name: 'OPS 问题解决',
    description: 'Option-Proposal-Suggestion，适合方案比选和建议。',
    category: 'work',
    tags: ['决策', '建议', '分析'],
    structure: [
      { type: 'background', title: '问题 (Problem)', intent: '我们要解决什么问题' },
      { type: 'case', title: '选项 (Options)', intent: '列举几个可能的解决方案' },
      { type: 'insight', title: '建议 (Proposal)', intent: '我推荐哪个方案，理由是什么' },
      { type: 'cta', title: '计划 (Plan)', intent: '具体的实施步骤' }
    ]
  },

  // --- 故事演讲类 ---
  {
    id: 'hero_journey',
    name: '英雄之旅',
    description: '好莱坞叙事结构，适合讲述个人成长、克服困难的故事。',
    category: 'story',
    tags: ['励志', '故事', '感悟'],
    structure: [
      { type: 'background', title: '平凡世界', intent: '描述改变发生前的生活状态' },
      { type: 'conflict', title: '冒险召唤', intent: '遇到了什么突发事件或挑战？' },
      { type: 'conflict', title: '至暗时刻', intent: '经历的最大的挫折或失败' },
      { type: 'turning_point', title: '归来与蜕变', intent: '如何战胜困难，获得了什么新的认知' },
      { type: 'insight', title: '宝藏分享', intent: '将这段经历提炼成的人生礼物' }
    ]
  },
  {
    id: 'golden_circle',
    name: '黄金圈法则',
    description: 'Simon Sinek 提出的伟大领袖思维模式：Why - How - What。',
    category: 'story',
    tags: ['愿景', '感召', '发布会'],
    structure: [
      { type: 'insight', title: '为什么 (Why)', intent: '分享你的信念、目的或初衷' },
      { type: 'transition', title: '如何做 (How)', intent: '解释实现理念的具体过程或差异化优势' },
      { type: 'case', title: '是什么 (What)', intent: '介绍具体的产品、服务或成果' },
      { type: 'cta', title: '号召 (Call to Action)', intent: '邀请听众加入这个愿景' }
    ]
  },

  // --- 即兴沟通类 ---
  {
    id: 'prep',
    name: 'PREP 观点表达',
    description: 'Point-Reason-Example-Point，最清晰的观点输出结构。',
    category: 'comm',
    tags: ['即兴', '回答', '沟通'],
    structure: [
      { type: 'insight', title: '核心观点 (Point)', intent: '开门见山，直接说出结论' },
      { type: 'background', title: '理由 (Reason)', intent: '支撑观点的逻辑或数据' },
      { type: 'case', title: '案例 (Example)', intent: '一个具体的例子来证明' },
      { type: 'ending', title: '重申 (Point)', intent: '总结并升华核心观点' }
    ]
  },
  {
    id: 'sandwich',
    name: '三明治反馈',
    description: '在赞美中夹带建议，让听众更容易接受你的意见。',
    category: 'comm',
    tags: ['反馈', '点评', '人际'],
    structure: [
      { type: 'opening', title: '认同 (Appreciate)', intent: '真诚地赞美对方做得好的地方' },
      { type: 'insight', title: '建议 (Advice)', intent: '指出可以改进的具体点' },
      { type: 'ending', title: '鼓励 (Encourage)', intent: '表达对未来的期待和信任' }
    ]
  },
  {
    id: 'total_split_total',
    name: '总分总结构',
    description: '最稳健的逻辑结构，适合条理清晰的说明性发言。',
    category: 'comm',
    tags: ['通用', '逻辑', '说明'],
    structure: [
      { type: 'opening', title: '总述', intent: '概括今天要讲的主题或三个要点' },
      { type: 'case', title: '第一点', intent: '详细阐述第一个要点' },
      { type: 'case', title: '第二点', intent: '详细阐述第二个要点' },
      { type: 'case', title: '第三点', intent: '详细阐述第三个要点' },
      { type: 'ending', title: '总结', intent: '回顾要点，加深印象' }
    ]
  }
];

const CATEGORIES = [
  { id: 'all', name: '全部' },
  { id: 'work', name: '职场汇报' },
  { id: 'story', name: '故事演讲' },
  { id: 'comm', name: '即兴沟通' }
];

// 映射处理
const TYPE_MAPPING = {
  'solution': 'insight',
  'hook': 'opening'
};

const getTemplate = (id) => {
  const tpl = TEMPLATES.find(t => t.id === id);
  if (!tpl) return null;
  
  return {
    ...tpl,
    structure: tpl.structure.map(step => ({
      ...step,
      type: TYPE_MAPPING[step.type] || step.type
    }))
  };
};

module.exports = {
  TEMPLATES,
  CATEGORIES,
  getTemplate
};