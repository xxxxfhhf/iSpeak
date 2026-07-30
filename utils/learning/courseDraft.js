/**
 * 课程 ↔ 演讲模板映射 — 学完课程后可一键按对应结构写稿
 */
const { getTemplate } = require('../templates.js');
const { createProjectFromTemplate } = require('../draftFactory.js');

/** courseId → 推荐模板（与手册路径演练要求对齐） */
const COURSE_TEMPLATE_MAP = {
  'G1V1-COURSE': { templateId: 'prep', draftTitle: '自我介绍演讲稿' },
  'G1V2-COURSE': { templateId: 'total_split_total', draftTitle: '主题演讲稿' },
  'G1V3-COURSE': { templateId: 'hero_journey', draftTitle: '破冰故事演讲稿' },
  'G1V4-COURSE': { templateId: 'sandwich', draftTitle: '点评反馈稿' },
  'G1X1-COURSE': { templateId: 'total_split_total', draftTitle: '开场技巧演讲稿' },
  'G1X2-COURSE': { templateId: 'total_split_total', draftTitle: '正文技巧演讲稿' },
  'G1X3-COURSE': { templateId: 'total_split_total', draftTitle: '结尾技巧演讲稿' },
  'G2V1-C1': { templateId: 'total_split_total', draftTitle: '语调节奏演讲稿' },
  'G2V1-C2': { templateId: 'total_split_total', draftTitle: '舞台呈现演讲稿' },
  'G2V2-COURSE': { templateId: 'golden_circle', draftTitle: '阅读分享演讲稿' },
  'G2X1-C1': { templateId: 'total_split_total', draftTitle: '有效倾听分享稿' },
  'G2X1-C2': { templateId: 'scqa', draftTitle: 'PPT 学习分享稿' },
  'G3V1-COURSE': { templateId: 'prep', draftTitle: '幽默演讲稿' },
  'G3V2-COURSE': { templateId: 'prep', draftTitle: '说服性演讲稿' },
  'G3V3-COURSE': { templateId: 'scqa', draftTitle: '职场汇报演讲稿' },
  'G3X1-COURSE': { templateId: 'ops', draftTitle: '工作坊备稿' },
  'G3X2-COURSE': { templateId: 'prep', draftTitle: '提问技巧演讲稿' },
  'G3X3-C1': { templateId: 'prep', draftTitle: '沟通风格演讲稿' },
  'G3X3-C2': { templateId: 'hero_journey', draftTitle: '沟通故事演讲稿' }
};

const DEFAULT_CONFIG = { templateId: 'total_split_total', draftTitle: '路径演练演讲稿' };

/** 获取课程对应的写稿配置 */
function getCourseDraftConfig(courseId) {
  const cfg = COURSE_TEMPLATE_MAP[courseId] || DEFAULT_CONFIG;
  const template = getTemplate(cfg.templateId);
  return {
    ...cfg,
    templateName: template ? template.name : '',
    templateDesc: template ? template.description : ''
  };
}

/** 生成第一块积木的预填提示 */
function buildDraftHint(course) {
  const lines = [];
  if (course.pathCode) lines.push(`【路径】${course.pathCode} · ${course.title}`);
  if (course.practiceGoal) lines.push(`【练习目标】${course.practiceGoal}`);
  if (course.learnContent) lines.push(`【学习要点】${course.learnContent}`);
  lines.push('');
  lines.push('（请在下方各积木中展开写稿…）');
  return lines.join('\n');
}

/** 构建 AI 向导用的碎片文本 */
function buildAiFragment(course) {
  const parts = [];
  if (course.learnContent) parts.push(`学习要点：${course.learnContent}`);
  if (course.practiceGoal) parts.push(`练习目标：${course.practiceGoal}`);
  return parts.join('\n\n');
}

/**
 * 按课程映射模板创建项目并返回 projectId
 * @param {object} course getCourse 返回的对象
 */
function startDraftFromCourse(course) {
  if (!course || !course.id) return null;
  const cfg = getCourseDraftConfig(course.id);
  const result = createProjectFromTemplate(cfg.templateId, {
    title: cfg.draftTitle,
    initialHint: buildDraftHint(course),
    learnSource: {
      courseId: course.id,
      pathCode: course.pathCode,
      templateId: cfg.templateId
    }
  });
  return result ? result.projectId : null;
}

module.exports = {
  COURSE_TEMPLATE_MAP,
  getCourseDraftConfig,
  buildDraftHint,
  buildAiFragment,
  startDraftFromCourse
};
