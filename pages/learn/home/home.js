// pages/learn/home/home.js
const LearningData = require('../../../utils/learningData.js');
const { parseCourseContent, enrichBlocks } = require('../../../utils/learning/contentParser.js');
const { openOfficialAccount, ClubConfig } = require('../../../utils/clubFollow.js');
const MemberLevel = require('../../../utils/memberLevel.js');

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
    clubFollowHint: '公众号「i演讲」· 视频号「厦门演讲俱乐部」',
    memberLevel: 'G1',
    memberLevelLabel: 'G1 第一阶',
    levelOptions: []
  },

  onLoad(options) {
    if (options.tab === 'guide') {
      this.setData({ activeTab: 'guide' });
    }
    this.loadHandbookIntro();
    this.setData({ levelOptions: MemberLevel.getLevelOptions() });
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

  onGoDaily() {
    wx.navigateTo({ url: '/pages/reading/daily/daily' });
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
    const memberLevel = MemberLevel.getMemberLevel();
    const isPathDone = (pathId) => LearningData.isPathGroupCompleted(pathId, pathMap);

    const totalCourses = LearningData.COURSES.length;
    const doneCourses = LearningData.COURSES.filter(c => courseMap[c.id] && courseMap[c.id].isCompleted).length;

    const requiredPaths = LearningData.PATHS.filter(p => p.required);
    const donePaths = requiredPaths.filter(p => isPathDone(p.id)).length;

    const stages = LearningData.STAGES.map(stage => {
      const stagePaths = LearningData.getRequiredPathsByStage(stage.id);
      const stageCourses = LearningData.getCoursesByStage(stage.id);
      const pathCompleted = stagePaths.filter(p => isPathDone(p.id)).length;
      const courseCompleted = stageCourses.filter(c => courseMap[c.id] && courseMap[c.id].isCompleted).length;

      const status = MemberLevel.getStageStatus(
        stage.id,
        pathMap,
        isPathDone,
        { pathCompleted, pathTotal: stagePaths.length, courseCompleted, courseTotal: stageCourses.length }
      );

      const statusTextMap = {
        locked: '未解锁',
        in_progress: MemberLevel.isStageUnlockedByLevel(stage.id) ? '进行中' : '进行中',
        completed: '已完成'
      };
      return {
        id: stage.id,
        name: stage.title,
        status,
        statusText: statusTextMap[status],
        pathCompleted,
        pathTotal: stagePaths.length,
        courseCompleted,
        courseTotal: stageCourses.length,
        unlockedByLevel: MemberLevel.isStageUnlockedByLevel(stage.id)
      };
    });

    this.setData({
      memberLevel,
      memberLevelLabel: MemberLevel.getLevelLabel(memberLevel),
      courseProgress: totalCourses ? Math.round(doneCourses / totalCourses * 100) : 0,
      pathProgress: requiredPaths.length ? Math.round(donePaths / requiredPaths.length * 100) : 0,
      stages
    });
  },

  /** 设置会员等级（按俱乐部评定） */
  onSetMemberLevel(e) {
    const level = e.currentTarget.dataset.level;
    const current = this.data.memberLevel;
    if (level === current) return;
    const opt = MemberLevel.getLevelOptions().find(o => o.id === level);
    wx.showModal({
      title: '设置会员等级',
      content: `确认为「${opt ? opt.name : level}」？\n${opt ? opt.desc : ''}\n\n将解锁该等级及之前所有阶段的学习与提交。`,
      success: (res) => {
        if (res.confirm) {
          MemberLevel.setMemberLevel(level);
          wx.showToast({ title: '等级已更新', icon: 'success' });
          this.loadProgress();
        }
      }
    });
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
    const id = e.currentTarget.dataset.id;
    const stage = this.data.stages.find(s => s.id === id);
    if (stage && stage.status === 'locked') {
      wx.showToast({ title: '请先完成上一阶或设置对应会员等级', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/learn/stage/stage?id=${id}` });
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
