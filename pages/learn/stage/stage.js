// pages/learn/stage/stage.js
const LearningData = require('../../../utils/learningData.js');
const { parseCourseContent, enrichBlocks } = require('../../../utils/learning/contentParser.js');
const { openOfficialAccount } = require('../../../utils/clubFollow.js');
const MemberLevel = require('../../../utils/memberLevel.js');

Page({
  data: {
    stageId: 'G1',
    stage: {},
    isUnlocked: true,
    activeTab: 'path',
    requiredPaths: [],
    electivePaths: [],
    requiredCourses: [],
    electiveCourses: [],
    epilogueBlocks: [],
    thanksBlocks: [],
    showEpilogue: false,
    showThanks: false
  },

  onLoad(options) {
    this.setData({ stageId: options.id || 'G1' });
    this.loadStageData();
  },

  onShow() {
    this.loadStageData();
  },

  loadStageData() {
    const { stageId } = this.data;
    const stage = LearningData.getStage(stageId) || {};
    const pathMap = wx.getStorageSync('user_path_progress') || {};
    const isPathDone = (pathId) => LearningData.isPathGroupCompleted(pathId, pathMap);
    const isUnlocked = MemberLevel.isStageUnlocked(stageId, pathMap, isPathDone);

    const paths = LearningData.getPathsByStage(stageId).map(p => ({
      ...p,
      typeLabel: p.required ? '必修' : '选修',
      itemCount: p.items.length,
      courseCount: p.items.filter(i => i.type === 'course').length,
      taskCount: p.items.filter(i => i.type === 'task').length,
      completed: LearningData.isPathGroupCompleted(p.id, pathMap)
    }));

    const courses = LearningData.getCoursesByStage(stageId);
    const epilogueBlocks = enrichBlocks(
      parseCourseContent(LearningData.getStageEpilogue(stageId)),
      'epilogue_' + stageId
    );
    const thanksBlocks = enrichBlocks(
      parseCourseContent(LearningData.getStageThanks(stageId)),
      'thanks_' + stageId
    );

    wx.setNavigationBarTitle({ title: stage.title || '阶段详情' });
    this.setData({
      stage,
      isUnlocked,
      requiredPaths: paths.filter(p => p.required),
      electivePaths: paths.filter(p => !p.required),
      requiredCourses: courses.filter(c => c.required),
      electiveCourses: courses.filter(c => !c.required),
      epilogueBlocks,
      thanksBlocks
    });
  },

  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onToggleEpilogue() {
    this.setData({ showEpilogue: !this.data.showEpilogue });
  },

  onToggleThanks() {
    this.setData({ showThanks: !this.data.showThanks });
  },

  onPathTap(e) {
    wx.navigateTo({
      url: `/pages/learn/path/path?id=${e.currentTarget.dataset.id}`
    });
  },

  onCourseTap(e) {
    wx.navigateTo({ url: `/pages/learn/course/course?id=${e.currentTarget.dataset.id}` });
  },

  onFollowOfficialAccount() {
    openOfficialAccount();
  }
});
