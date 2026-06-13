/**
 * 路径表格结构 — 与晋级手册「级别-项目-要求-时间」一致
 * 一条路径(path)包含多个项目(items)：课程学习(course) + 线下演练(task)
 */

const PATHS = [
  // ==================== L1 必修 ====================
  {
    id: 'L1V1', stageId: 'L1', code: 'L1V1', title: 'L1V1（自我介绍）', required: true,
    items: [
      { id: 'L1V1-i1', type: 'course', courseId: 'L1V1-COURSE', project: '自我介绍', requirement: '完成自我介绍课程学习', duration: '' },
      { id: 'L1V1-i2', type: 'task', code: 'L1V1-1', project: '自我介绍演讲', requirement: '线下俱乐部完成一次自我介绍演讲', duration: '2-3min' },
      { id: 'L1V1-i3', type: 'task', code: 'L1V1-2', project: '自我介绍迭代', requirement: '基于点评，再次线下自我介绍演讲', duration: '2-3min' }
    ]
  },
  {
    id: 'L1V2', stageId: 'L1', code: 'L1V2', title: 'L1V2（主题演讲）', required: true,
    items: [
      { id: 'L1V2-i1', type: 'course', courseId: 'L1V2-COURSE', project: '演讲结构', requirement: '完成演讲结构学习', duration: '' },
      { id: 'L1V2-i2', type: 'task', code: 'L1V2-1', project: '主题演讲', requirement: '任选其中一个演讲结构，发表一次主题演讲', duration: '2-3min' },
      { id: 'L1V2-i3', type: 'task', code: 'L1V2-2', project: '演讲迭代', requirement: '根据点评者建议，完成一场主题演讲迭代', duration: '2-3min' }
    ]
  },
  {
    id: 'L1V3', stageId: 'L1', code: 'L1V3', title: 'L1V3（破冰演讲）', required: true,
    items: [
      { id: 'L1V3-i1', type: 'course', courseId: 'L1V3-COURSE', project: '故事学习', requirement: '完成故事基本框架课程学习', duration: '' },
      { id: 'L1V3-i2', type: 'task', code: 'L1V3-1', project: '破冰演讲', requirement: '任意主题备稿演讲，能掌握演讲稿基本结构以及基本的故事结构', duration: '5-7min' },
      { id: 'L1V3-i3', type: 'task', code: 'L1V3-2', project: '破冰迭代', requirement: '完成破冰演讲迭代，并通过考核', duration: '5-7min' }
    ]
  },
  {
    id: 'L1V4', stageId: 'L1', code: 'L1V4', title: 'L1V4（点评学习）', required: true,
    items: [
      { id: 'L1V4-i1', type: 'course', courseId: 'L1V4-COURSE', project: '点评学习', requirement: '完成点评课程学习', duration: '' },
      { id: 'L1V4-i2', type: 'task', code: 'L1V4-1', project: '点评角色', requirement: '担任一次点评官', duration: '2-3min' }
    ]
  },
  // ==================== L1 选修 ====================
  {
    id: 'L1X1', stageId: 'L1', code: 'L1X1', title: 'L1X1（开场技巧）', required: false,
    items: [
      { id: 'L1X1-i0', type: 'course', courseId: 'L1X1-COURSE', project: '开场：赢得听众的兴趣', requirement: '完成课程学习', duration: '' },
      { id: 'L1X1-i1', type: 'task', code: 'L1X1-1', project: '备稿演讲', requirement: '任选其中一个开头技巧，发表一次备稿演讲', duration: '5-7min' }
    ]
  },
  {
    id: 'L1X2', stageId: 'L1', code: 'L1X2', title: 'L1X2（正文技巧）', required: false,
    items: [
      { id: 'L1X2-i0', type: 'course', courseId: 'L1X2-COURSE', project: '正文：类比、具体化、重复，让演讲更生动', requirement: '完成课程学习', duration: '' },
      { id: 'L1X2-i1', type: 'task', code: 'L1X2-1', project: '备稿演讲', requirement: '任意主题备稿演讲，运用至少两个及以上的正文技巧（类比、具体化、重复）', duration: '5-7min' }
    ]
  },
  {
    id: 'L1X3', stageId: 'L1', code: 'L1X3', title: 'L1X3（结尾技巧）', required: false,
    items: [
      { id: 'L1X3-i0', type: 'course', courseId: 'L1X3-COURSE', project: '结尾：如何让演讲深入人心？', requirement: '完成课程学习', duration: '' },
      { id: 'L1X3-i1', type: 'task', code: 'L1X3-1', project: '备稿演讲', requirement: '任意主题备稿演讲，运用排比或者总结性语言结尾', duration: '5-7min' }
    ]
  },
  // ==================== L2 必修 ====================
  {
    id: 'L2V1', stageId: 'L2', code: 'L2V1', title: 'L2V1（台风声音）', required: true,
    items: [
      { id: 'L2V1-i1', type: 'course', courseId: 'L2V1-C1', project: '语调节奏', requirement: '语音语调课程学习', duration: '' },
      { id: 'L2V1-i2', type: 'course', courseId: 'L2V1-C2', project: '舞台呈现', requirement: '肢体动作课程学习', duration: '' },
      { id: 'L2V1-i3', type: 'task', code: 'L2V1-1', project: '关注声音', requirement: '任意主题备稿演讲，关注到自己的声音，做到声音有起伏', duration: '5-7min' },
      { id: 'L2V1-i4', type: 'task', code: 'L2V1-2', project: '关注肢体', requirement: '任意主题备稿演讲，关注自己的肢体动作，做到适当的手势与走动', duration: '5-7min' },
      { id: 'L2V1-i5', type: 'task', code: 'L2V1-3', project: '演讲迭代', requirement: '基于前两次点评进行迭代，肢体动作和语音语调都有明显的提升', duration: '5-7min' }
    ]
  },
  {
    id: 'L2V2', stageId: 'L2', code: 'L2V2', title: 'L2V2（阅读分享）', required: true,
    items: [
      { id: 'L2V2-i1', type: 'course', courseId: 'L2V2-COURSE', project: '课程学习', requirement: '《如何写好阅读分享演讲稿》课程学习', duration: '' },
      { id: 'L2V2-i2', type: 'task', code: 'L2V2-1', project: '阅读分享', requirement: '一次阅读分享备稿演讲', duration: '6-10min' },
      { id: 'L2V2-i3', type: 'task', code: 'L2V2-2', project: '分享迭代', requirement: '基于前次点评，对阅读分享演讲迭代', duration: '6-10min' }
    ]
  },
  {
    id: 'L2V3', stageId: 'L2', code: 'L2V3', title: 'L2V3（回顾总结）', required: true,
    items: [
      { id: 'L2V3-i1', type: 'task', code: 'L2V3-1', project: '学习回顾', requirement: '灵活运用 L1 和 L2 所学知识，做一次备稿演讲', duration: '5-7min' }
    ]
  },
  // ==================== L2 选修 ====================
  {
    id: 'L2X1', stageId: 'L2', code: 'L2X1', title: 'L2X1 选修：PPT分享', required: false,
    items: [
      { id: 'L2X1-i1', type: 'course', courseId: 'L2X1-C1', project: '《有效倾听》', requirement: '学习《有效倾听》课程', duration: '' },
      { id: 'L2X1-i2', type: 'course', courseId: 'L2X1-C2', project: '《PPT 设计基本原则》', requirement: '学习《PPT 设计基本原则：让你在演讲中脱颖而出》课程', duration: '' },
      { id: 'L2X1-i3', type: 'task', code: 'L2X1-1', project: '《有效倾听分享》PPT 演讲', requirement: '基于《PPT 设计基本原则》课程，设计《有效倾听》课程 PPT，并在俱乐部完成一次学习分享', duration: '8-10min' }
    ]
  },
  // ==================== L3 必修 ====================
  {
    id: 'L3V1', stageId: 'L3', code: 'L3V1', title: 'L3V1（用幽默，为演讲增添笑点）', required: true,
    items: [
      { id: 'L3V1-i1', type: 'course', courseId: 'L3V1-COURSE', project: '幽默技巧', requirement: '学习手册《幽默，为演讲增添笑点》', duration: '' },
      { id: 'L3V1-i2', type: 'task', code: 'L3V1-1', project: '幽默演讲', requirement: '任意主题幽默型备稿演讲，要求至少引发 3 次听众发笑', duration: '5-7min' },
      { id: 'L3V1-i3', type: 'task', code: 'L3V1-2', project: '演讲迭代', requirement: '根据点评迭代前一次演讲', duration: '5-7min' }
    ]
  },
  {
    id: 'L3V2', stageId: 'L3', code: 'L3V2', title: 'L3V2（说服性演讲）', required: true,
    items: [
      { id: 'L3V2-i1', type: 'course', courseId: 'L3V2-COURSE', project: '《说服性演讲》学习', requirement: '学习手册《说服性演讲》', duration: '' },
      { id: 'L3V2-i2', type: 'task', code: 'L3V2-1', project: '说服性演讲', requirement: '任意主题说服性演讲，可以说服养成某一个习惯、也可以是参加一次活动（不要打广告）', duration: '5-7min' },
      { id: 'L3V2-i3', type: 'task', code: 'L3V2-2', project: '演讲迭代', requirement: '根据前一次点评迭代说服性演讲', duration: '5-7min' }
    ]
  },
  {
    id: 'L3V3', stageId: 'L3', code: 'L3V3', title: 'L3V3（职场与社交演讲）', required: true,
    items: [
      { id: 'L3V3-i1', type: 'course', courseId: 'L3V3-COURSE', project: '职场与社交演讲', requirement: '学习手册《职场与社交演讲》', duration: '' },
      { id: 'L3V3-i2', type: 'task', code: 'L3V3-1', project: '学习总结（PPT）', requirement: '在俱乐部进行一次 10 分钟的学习收获总结，要求 PPT 汇报', duration: '8-10min' },
      { id: 'L3V3-i3', type: 'task', code: 'L3V3-2', project: '社交演讲', requirement: '运用感回祝结构，在俱乐部发表一次 2-3min 的学习感言感谢（家人、导师、朋友、俱乐部等）', duration: '2-3min' }
    ]
  },
  {
    id: 'L3V4', stageId: 'L3', code: 'L3V4', title: 'L3V4（总结性演讲）', required: true,
    items: [
      { id: 'L3V4-i1', type: 'task', code: 'L3V4', project: '总结性演讲', requirement: '题目自拟，主题《我在俱乐部的收获》（故事演讲）。要求内容逻辑清晰、故事有吸引力、台风呈现自然，语音语调达到抑扬顿挫要求。完成即可颁发演讲毕业证书', duration: '8-10min' }
    ]
  },
  // ==================== L3 选修 ====================
  {
    id: 'L3X1', stageId: 'L3', code: 'L3X1', title: 'L3X1（目标管理·导师认证）', required: false,
    items: [
      { id: 'L3X1-i1', type: 'course', courseId: 'L3X1-COURSE', project: '任意演讲知识工作坊—导师认证', requirement: '按照 SMART 原则规划导师认证计划。完成要求：任选一门演讲知识，线下安排工作坊，获得综合评分 80 分以上（参考 L3X1 课程末尾的评分表模板）', duration: '10-30min' }
    ]
  },
  {
    id: 'L3X2', stageId: 'L3', code: 'L3X2', title: 'L3X2（学会提问）', required: false,
    items: [
      { id: 'L3X2-i1', type: 'course', courseId: 'L3X2-COURSE', project: '学会提问', requirement: '完成课程学习', duration: '' },
      { id: 'L3X2-i2', type: 'task', code: 'L3X2', project: '备稿演讲', requirement: '任意主题备稿演讲，要求演讲至少用上一次提问技巧', duration: '' }
    ]
  },
  {
    id: 'L3X3', stageId: 'L3', code: 'L3X3', title: 'L3X3（沟通风格 / 建立联系）', required: false,
    items: [
      { id: 'L3X3-i1', type: 'course', courseId: 'L3X3-C1', project: '沟通风格', requirement: '完成课程学习', duration: '' },
      { id: 'L3X3-i2', type: 'course', courseId: 'L3X3-C2', project: '建立联系', requirement: '完成课程学习', duration: '' },
      { id: 'L3X3-i3', type: 'task', code: 'L3X3', project: '备稿演讲', requirement: '题目自拟，以《我一次成功/失败的沟通》为主题，发表 5~7 分钟的演讲', duration: '5-7min' }
    ]
  }
];

function getPathsByStage(stageId) {
  return PATHS.filter(p => p.stageId === stageId);
}

function getPath(id) {
  return PATHS.find(p => p.id === id);
}

function getRequiredPathsByStage(stageId) {
  return PATHS.filter(p => p.stageId === stageId && p.required);
}

/** 获取某路径下所有课程 ID */
function getCourseIdsByPath(pathId) {
  const path = getPath(pathId);
  if (!path) return [];
  return path.items.filter(i => i.type === 'course' && i.courseId).map(i => i.courseId);
}

/** 扁平化所有课程 ID（去重） */
function getAllCourseIds() {
  const ids = new Set();
  PATHS.forEach(p => p.items.forEach(i => { if (i.courseId) ids.add(i.courseId); }));
  return [...ids];
}

module.exports = {
  PATHS,
  getPathsByStage,
  getPath,
  getRequiredPathsByStage,
  getCourseIdsByPath,
  getAllCourseIds
};
