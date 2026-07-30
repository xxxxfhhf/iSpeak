/**
 * 按演讲模板创建写稿项目 — templates 页与路径学习联动共用
 */
const Storage = require('./storage.js');
const { getTemplate } = require('./templates.js');

/**
 * @param {string} templateId 模板 ID
 * @param {object} options
 * @param {string} [options.title] 项目标题
 * @param {string} [options.initialHint] 预填到第一块积木的提示文案
 * @param {object} [options.learnSource] { courseId, pathCode, templateId }
 * @returns {{ projectId: string, template: object } | null}
 */
function createProjectFromTemplate(templateId, options = {}) {
  const template = getTemplate(templateId);
  if (!template) return null;

  const title = options.title || `未命名 ${template.name}`;
  const initialHint = options.initialHint || '';
  const projectId = Storage.createProject(title);

  const cards = template.structure.map((step, index) => ({
    id: projectId + '_' + index,
    type: step.type,
    title: step.title,
    typeLabel: step.title.split(' ')[0],
    intent: step.intent,
    // 第一块预填课程练习目标等，便于学习后直接开写
    content: index === 0 && initialHint ? initialHint : '',
    durationSec: 0,
    quotes: []
  }));

  const payload = { cards };
  if (options.learnSource) {
    payload.learnSource = options.learnSource;
  }
  Storage.saveProjectData(projectId, payload);

  Storage.saveProjectMeta({
    id: projectId,
    title,
    cardCount: cards.length,
    totalDurationSec: 0,
    progress: initialHint ? cards.filter(c => c.content).length / cards.length : 0,
    hasUnconfirmedAi: false,
    learnCourseId: options.learnSource?.courseId || ''
  });

  return { projectId, template };
}

module.exports = {
  createProjectFromTemplate
};
