// pages/learn/home/home.js
const LearningData = require('../../../utils/learningData.js');
const { parseCourseContent, enrichBlocks } = require('../../../utils/learning/contentParser.js');
const { openOfficialAccount, ClubConfig } = require('../../../utils/clubFollow.js');

Page({
  data: {
    activeTab: 'learn',
    courseProgress: 0,
    pathProgress: 0,
    stages: [],
    prefaceBlocks: [],
    clubBlocks: [],
    memberBlocks: [],
    memberBenefits: [],
    showClubIntro: false,
    showPreface: false,
    showMemberTips: false,
    clubFollowHint: '公众号「i演讲」· 视频号「厦门演讲俱乐部」'
  },

  onLoad(options) {
    if (options.tab === 'guide') {
      this.setData({ activeTab: 'guide' });
    }
    this.loadHandbookIntro();
    this.loadProgress();
  },

  onShow() {
    this.loadProgress();
  },

  /** 切换「路径学习 / 手册导读」 */
  onTabChange(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  /** 从路径学习页快捷进入手册导读 */
  onGoGuide() {
    this.setData({ activeTab: 'guide' });
  },

  loadHandbookIntro() {
    const handbook = LearningData.getHandbookIntro() || {};
    const memberBenefits = LearningData.getMemberBenefits() || [];

    this.setData({
      prefaceBlocks: enrichBlocks(parseCourseContent(handbook.preface), 'preface'),
      clubBlocks: enrichBlocks(parseCourseContent(handbook.clubIntro), 'club'),
      memberBlocks: enrichBlocks(parseCourseContent(handbook.memberTips), 'member'),
      memberBenefits
    });
  },

  loadProgress() {
    const courseMap = wx.getStorageSync('user_course_progress') || {};
    const pathMap = wx.getStorageSync('user_path_progress') || {};

    const totalCourses = LearningData.COURSES.length;
    const doneCourses = LearningData.COURSES.filter(c => courseMap[c.id] && courseMap[c.id].isCompleted).length;

    const requiredPaths = LearningData.PATHS.filter(p => p.required);
    const donePaths = requiredPaths.filter(p => LearningData.isPathGroupCompleted(p.id, pathMap)).length;

    const stages = LearningData.STAGES.map(stage => {
      const stagePaths = LearningData.getRequiredPathsByStage(stage.id);
      const stageCourses = LearningData.getCoursesByStage(stage.id);
      const pathCompleted = stagePaths.filter(p => LearningData.isPathGroupCompleted(p.id, pathMap)).length;
      const courseCompleted = stageCourses.filter(c => courseMap[c.id] && courseMap[c.id].isCompleted).length;

      let status = 'locked';
      if (stage.id === 'L1') status = 'in_progress';
      else if (stage.id === 'L2' && this.allRequiredDone('L1', pathMap)) status = 'in_progress';
      else if (stage.id === 'L3' && this.allRequiredDone('L2', pathMap)) status = 'in_progress';

      if (stage.id === 'L1' && pathCompleted === stagePaths.length && courseCompleted === stageCourses.length) status = 'completed';
      if (stage.id === 'L2' && status === 'in_progress' && pathCompleted === stagePaths.length) status = 'completed';
      if (stage.id === 'L3' && status === 'in_progress' && pathCompleted === stagePaths.length) status = 'completed';

      const statusTextMap = { locked: '未解锁', in_progress: '进行中', completed: '已完成' };
      return {
        id: stage.id,
        name: stage.title,
        status,
        statusText: statusTextMap[status],
        pathCompleted,
        pathTotal: stagePaths.length,
        courseCompleted,
        courseTotal: stageCourses.length
      };
    });

    this.setData({
      courseProgress: totalCourses ? Math.round(doneCourses / totalCourses * 100) : 0,
      pathProgress: requiredPaths.length ? Math.round(donePaths / requiredPaths.length * 100) : 0,
      stages
    });
  },

  allRequiredDone(stageId, pathMap) {
    return LearningData.getRequiredPathsByStage(stageId).every(p => LearningData.isPathGroupCompleted(p.id, pathMap));
  },

  onTogglePreface() {
    this.setData({ showPreface: !this.data.showPreface });
  },

  onToggleClubIntro() {
    this.setData({ showClubIntro: !this.data.showClubIntro });
  },

  onToggleMemberTips() {
    this.setData({ showMemberTips: !this.data.showMemberTips });
  },

  onStageTap(e) {
    wx.navigateTo({ url: `/pages/learn/stage/stage?id=${e.currentTarget.dataset.id}` });
  },

  onContinueLearn() {
    const current = this.data.stages.find(s => s.status === 'in_progress') || this.data.stages[0];
    if (current) wx.navigateTo({ url: `/pages/learn/stage/stage?id=${current.id}` });
  },

  onSearch() {
    wx.navigateTo({ url: '/pages/learn/search/search' });
  },

  onGoToCert() {
    wx.navigateTo({ url: '/pages/cert/home/home' });
  },

  /** 跳转关注俱乐部公众号 */
  onFollowOfficialAccount() {
    openOfficialAccount();
  }
});
