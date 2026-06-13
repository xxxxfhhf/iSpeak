/**
 * 路径学习数据入口 — 路径表格结构 + 完整课程正文
 * 注意：微信小程序 require 须写完整 .js 路径，且避免 courseContents 目录作为模块入口
 */
const pathStructure = require('./learning/pathStructure.js');
const pathIntro = require('./learning/pathIntro.js');
const certIntro = require('./learning/certIntro.js');
const courseImages = require('./learning/courseImages.js');
const courseDraft = require('./learning/courseDraft.js');
const l1Courses = require('./learning/l1Courses.js').COURSES;
const l2Courses = require('./learning/l2Courses.js').COURSES;
const l3Courses = require('./learning/l3Courses.js').COURSES;

/** 全部课程（L1 + L2 + L3） */
const COURSES = l1Courses.concat(l2Courses, l3Courses);

/** 从路径结构反查课程所属路径编码与必修/选修 */
function buildCourseMetaMap() {
  const map = {};
  pathStructure.PATHS.forEach(p => {
    p.items.forEach(item => {
      if (item.type === 'course' && item.courseId) {
        map[item.courseId] = {
          pathCode: p.code,
          pathId: p.id,
          pathTitle: p.title,
          required: p.required
        };
      }
    });
  });
  return map;
}
const COURSE_META = buildCourseMetaMap();

const STAGES = [
  {
    id: 'L1',
    title: 'L1 第一阶',
    desc: '自我介绍、演讲结构、故事、点评；选修开场/正文/结尾',
    unlockHint: '默认解锁，完成全部必修路径后解锁 L2'
  },
  {
    id: 'L2',
    title: 'L2 第二阶',
    desc: '台风声音、阅读分享、回顾总结；选修 PPT 分享',
    unlockHint: '需完成 L1 全部必修路径'
  },
  {
    id: 'L3',
    title: 'L3 第三阶',
    desc: '幽默、说服、职场社交、总结性演讲；导师认证选修',
    unlockHint: '需完成 L2 全部必修路径'
  }
];

function getCourse(id) {
  const base = COURSES.find(c => c.id === id);
  if (!base) return null;
  const meta = COURSE_META[id] || {};
  return {
    ...base,
    pathCode: meta.pathCode || '',
    pathId: meta.pathId || '',
    pathTitle: meta.pathTitle || '',
    required: meta.required !== undefined ? meta.required : true
  };
}

function getCoursesByStage(stageId) {
  return COURSES.filter(c => c.stageId === stageId).map(c => getCourse(c.id));
}

function searchCourses(keyword) {
  const kw = (keyword || '').trim().toLowerCase();
  if (!kw) return [];
  const match = (t) => (t || '').toLowerCase().includes(kw);
  return COURSES.filter(c =>
    match(c.title) || match(c.learnContent) || match(c.courseContent) || match(c.id)
  );
}

/** 获取路径下某一项目 */
function getPathItem(pathId, itemId) {
  const path = pathStructure.getPath(pathId);
  if (!path) return null;
  return path.items.find(i => i.id === itemId) || null;
}

/** 搜索：课程 + 路径项目 */
function searchContent(keyword) {
  const courses = searchCourses(keyword);
  const kw = (keyword || '').trim().toLowerCase();
  const paths = [];
  if (kw) {
    pathStructure.PATHS.forEach(p => {
      p.items.forEach(item => {
        const text = `${p.title} ${item.project} ${item.requirement} ${item.code || ''}`.toLowerCase();
        if (text.includes(kw)) {
          paths.push({ pathId: p.id, pathTitle: p.title, ...item });
        }
      });
    });
  }
  return { courses, paths };
}

/** 路径是否全部演练任务完成（必修路径：所有 task 需提交+线下通过） */
function isPathGroupCompleted(pathId, pathProgressMap) {
  const path = pathStructure.getPath(pathId);
  if (!path) return false;
  const tasks = path.items.filter(i => i.type === 'task');
  if (tasks.length === 0) return true;
  return tasks.every(t => {
    const key = `${pathId}:${t.id}`;
    const prog = pathProgressMap[key];
    return prog && prog.isCompleted;
  });
}

module.exports = {
  STAGES,
  PATHS: pathStructure.PATHS,
  COURSES,
  getStage: (id) => STAGES.find(s => s.id === id),
  getPathsByStage: pathStructure.getPathsByStage,
  getPath: pathStructure.getPath,
  getRequiredPathsByStage: pathStructure.getRequiredPathsByStage,
  getCourseIdsByPath: pathStructure.getCourseIdsByPath,
  getCourse,
  getCoursesByStage,
  getPathItem,
  searchContent,
  isPathGroupCompleted,
  getStageIntro: pathIntro.getStageIntro,
  getStageThanks: pathIntro.getStageThanks,
  getStageEpilogue: pathIntro.getStageEpilogue,
  getPathIntro: pathIntro.getPathIntro,
  getHandbookIntro: pathIntro.getHandbookIntro,
  getMemberBenefits: pathIntro.getMemberBenefits,
  getMentorIntro: certIntro.getMentorIntro,
  getMentorBenefits: certIntro.getMentorBenefits,
  getCourseImages: courseImages.getCourseImages,
  getCourseDraftConfig: courseDraft.getCourseDraftConfig,
  startDraftFromCourse: courseDraft.startDraftFromCourse,
  buildAiFragmentFromCourse: courseDraft.buildAiFragment
};
