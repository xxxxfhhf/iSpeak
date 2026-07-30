/**
 * 会议议程积木定义 — 参考 677/678/681 议程表结构
 * 单页搭建：开关环节 + 表格填写行
 */

/** 固定俱乐部文案（议程表头） */
const CLUB_HEADER = {
  clubName: '厦门演讲俱乐部',
  intro: '厦门演讲俱乐部是原CCB厦门中文演讲俱乐部，成立于2009年，是厦门第一家纯中文并且是幽默型的演讲俱乐部，也是目前厦门最资深的演讲俱乐部之一。',
  purpose: '宗旨：提供互助陪伴、积极支持的学习环境，全面提升会员的阅读、思维及表达的综合能力。',
  values: '价值观：互助陪伴  自我超越',
  taboo: '禁忌话题：政治、宗教、性、传销'
};

/** 标准时间规则文案 */
const TIME_RULES = `一、3分钟以内演讲及角色：剩余1分钟绿牌、剩余30秒黄牌、时间到红牌、超时30秒响铃
二、3分钟以上演讲及角色：剩余2分钟绿牌、剩余1分钟黄牌、时间到红牌、超时30秒响铃`;

/** 环节积木类型 */
const BLOCK_TYPES = {
  reception: { label: '接待/签到', defaultDuration: 10, hasRole: true },
  opening: { label: '开幕/俱乐部介绍', defaultDuration: 5, hasRole: true },
  role_intro_section: { label: '角色亮相环节', isSection: true },
  role_intro: { label: '角色职责介绍', defaultDuration: 2, hasRole: true, hasSubLabel: true },
  table_topics: { label: '即兴演讲环节', isSection: true, defaultDuration: 25 },
  table_topics_speech: { label: '即兴演讲', defaultDuration: 25, hasRole: true },
  prepared_section: { label: '备稿演讲环节', isSection: true },
  prepared_speech: { label: '备稿演讲', defaultDuration: 7, hasTitle: true, hasPathCode: true, hasRole: true },
  silence: { label: '静默1分钟', defaultDuration: 1, hasRole: true },
  break: { label: '会间休息', defaultDuration: 5, hasRole: true },
  workshop_section: { label: '工作坊环节', isSection: true },
  workshop: { label: '工作坊', defaultDuration: 30, hasTitle: true, hasRole: true },
  eval_section: { label: '点评环节', isSection: true },
  eval_table_topics: { label: '即兴演讲点评', defaultDuration: 10, hasRole: true },
  eval_prepared: { label: '备稿演讲点评', defaultDuration: 3, hasRole: true, hasSubLabel: true },
  eval_humor: { label: '幽默报告', defaultDuration: 2, hasRole: true },
  eval_filler: { label: '赘字报告', defaultDuration: 2, hasRole: true },
  eval_timer: { label: '时间报告', defaultDuration: 2, hasRole: true },
  eval_general: { label: '会议总评', defaultDuration: 12, hasRole: true },
  closing_section: { label: '颁奖及闭会环节', isSection: true },
  closing_guest: { label: '来宾会后感言、投票', defaultDuration: 5, hasRole: true },
  closing_award: { label: '颁发奖项', defaultDuration: 3, hasRole: true, hasSubLabel: true }
};

/** 生成唯一积木 id */
function genBlockId(type) {
  return `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/** 创建一行积木实例 */
function createBlock(type, overrides = {}) {
  const def = BLOCK_TYPES[type] || { label: type, defaultDuration: 5 };
  return {
    id: genBlockId(type),
    type,
    enabled: true,
    label: overrides.label || def.label,
    subLabel: overrides.subLabel || '',
    role: overrides.role || '',
    name: overrides.name || '',
    title: overrides.title || '',
    pathCode: overrides.pathCode || '',
    duration: overrides.duration !== undefined ? overrides.duration : (def.defaultDuration || 5),
    durationText: overrides.durationText || '',
    note: overrides.note || '',
    ...overrides
  };
}

/** 角色亮相默认子项 */
function defaultRoleIntroBlocks() {
  return [
    createBlock('role_intro', { label: '总主持开场破冰', role: '总主持', duration: 5 }),
    createBlock('role_intro', { label: '时间官职责介绍', role: '时间官', duration: 2 }),
    createBlock('role_intro', { label: '幽默官职责介绍', role: '幽默官', duration: 1 }),
    createBlock('role_intro', { label: '赘字官职责介绍', role: '赘字官', duration: 1 }),
    createBlock('role_intro', { label: '拍照官亮相', role: '拍照官', duration: 0, durationText: '/' }),
    createBlock('role_intro', { label: '总点评职责介绍', role: '总点评', duration: 1 })
  ];
}

/** 备稿演讲默认 3 篇 */
function defaultPreparedSpeeches(count = 3) {
  const list = [];
  for (let i = 0; i < count; i++) {
    list.push(createBlock('prepared_speech', {
      label: `备稿演讲${i + 1}`,
      role: `备稿演讲${i + 1}`,
      duration: i === 0 ? 3 : 7,
      durationText: i === 0 ? "2-3'" : "5-7'"
    }));
    if (i < count - 1) {
      list.push(createBlock('silence', { role: '总主持', duration: 1 }));
    }
  }
  return list;
}

/** 点评环节默认 */
function defaultEvalBlocks(hasTableTopics = true, preparedCount = 3) {
  const blocks = [];
  if (hasTableTopics) {
    blocks.push(createBlock('eval_table_topics', { role: '即兴点评', duration: 10 }));
  }
  for (let i = 0; i < preparedCount; i++) {
    blocks.push(createBlock('eval_prepared', {
      label: `备稿演讲点评${i + 1}`,
      subLabel: `备稿点评${i + 1}`,
      duration: 3
    }));
  }
  blocks.push(
    createBlock('eval_humor', { role: '幽默官', duration: 2 }),
    createBlock('eval_filler', { role: '赘字官', duration: 2 }),
    createBlock('eval_timer', { role: '时间官', duration: 2 }),
    createBlock('eval_general', { role: '总点评', duration: 12 })
  );
  return blocks;
}

/** 闭会默认 */
function defaultClosingBlocks() {
  return [
    createBlock('closing_guest', { role: '总主持', duration: 5 }),
    createBlock('closing_award', { label: '最佳即兴演讲者', role: '总点评', duration: 3 }),
    createBlock('closing_award', { label: '颁发最佳人气奖', role: '总点评', duration: 0 }),
    createBlock('closing_award', { label: '颁发最佳点评奖', role: '总点评', duration: 0 }),
    createBlock('closing_award', { label: '颁发最佳角色奖', role: '总点评', duration: 0 }),
    createBlock('closing_award', { label: '颁发幽默之王', role: '总点评', duration: 0 })
  ];
}

module.exports = {
  CLUB_HEADER,
  TIME_RULES,
  BLOCK_TYPES,
  genBlockId,
  createBlock,
  defaultRoleIntroBlocks,
  defaultPreparedSpeeches,
  defaultEvalBlocks,
  defaultClosingBlocks
};
