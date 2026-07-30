/**
 * 会员等级分级 — 老会员可按俱乐部评定设置 G1/G2/G3，解锁对应阶段
 * 与路径进度解锁并存：等级解锁 OR 上一阶必修完成
 */
const { getRequiredPathsByStage } = require('./learning/pathStructure.js');

const PROFILE_KEY = 'user_member_profile';
const STAGE_ORDER = { G1: 1, G2: 2, G3: 3 };
const LEVEL_OPTIONS = [
  { id: 'G1', name: 'G1 第一阶', desc: '新会员 / 第一阶学习中' },
  { id: 'G2', name: 'G2 第二阶', desc: '已完成第一阶，第二阶会员' },
  { id: 'G3', name: 'G3 第三阶', desc: '第三阶会员 / 可导师认证' }
];

function getMemberProfile() {
  return wx.getStorageSync(PROFILE_KEY) || { level: 'G1', updatedAt: 0 };
}

/** 当前会员等级 G1 | G2 | G3 */
function getMemberLevel() {
  return getMemberProfile().level || 'G1';
}

/** 设置会员等级（按俱乐部评定由会员自行选择） */
function setMemberLevel(level) {
  if (!STAGE_ORDER[level]) return false;
  wx.setStorageSync(PROFILE_KEY, { level, updatedAt: Date.now() });
  return true;
}

function getLevelOptions() {
  return LEVEL_OPTIONS;
}

function getLevelLabel(level) {
  const opt = LEVEL_OPTIONS.find(o => o.id === level);
  return opt ? opt.name : level;
}

/** 会员等级是否已覆盖该阶段 */
function isStageUnlockedByLevel(stageId) {
  const stageOrder = STAGE_ORDER[stageId] || 0;
  const memberOrder = STAGE_ORDER[getMemberLevel()] || 1;
  return stageOrder > 0 && stageOrder <= memberOrder;
}

/** 上一阶必修路径是否全部演练完成 */
function isPrevStagePathsDone(stageId, pathMap, isPathGroupCompleted) {
  const prevId = stageId === 'G2' ? 'G1' : stageId === 'G3' ? 'G2' : null;
  if (!prevId) return false;
  return getRequiredPathsByStage(prevId).every(p => isPathGroupCompleted(p.id, pathMap));
}

/**
 * 阶段是否可学习/提交
 * @param {Function} isPathGroupCompleted (pathId, pathMap) => boolean
 */
function isStageUnlocked(stageId, pathMap, isPathGroupCompleted) {
  if (stageId === 'G1') return true;
  if (isStageUnlockedByLevel(stageId)) return true;
  return isPrevStagePathsDone(stageId, pathMap, isPathGroupCompleted);
}

/** 阶段卡片状态：locked | in_progress | completed */
function getStageStatus(stageId, pathMap, isPathGroupCompleted, stats) {
  const { pathCompleted, pathTotal, courseCompleted, courseTotal } = stats;
  const unlocked = isStageUnlocked(stageId, pathMap, isPathGroupCompleted);
  if (!unlocked) return 'locked';

  let completed = false;
  if (stageId === 'G1') {
    completed = pathCompleted === pathTotal && courseCompleted === courseTotal;
  } else {
    completed = pathCompleted === pathTotal;
  }
  return completed ? 'completed' : 'in_progress';
}

module.exports = {
  PROFILE_KEY,
  getMemberProfile,
  getMemberLevel,
  setMemberLevel,
  getLevelOptions,
  getLevelLabel,
  isStageUnlockedByLevel,
  isStageUnlocked,
  getStageStatus
};
