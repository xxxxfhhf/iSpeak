// pages/learn/path/path.js — 一条路径含多门课程 + 多个演练项目
const Storage = require('../../../utils/storage');
const LearningData = require('../../../utils/learningData');
const { openOfficialAccount } = require('../../../utils/clubFollow.js');
const MemberLevel = require('../../../utils/memberLevel.js');

const PATH_PROGRESS_KEY = 'user_path_progress';
const COURSE_PROGRESS_KEY = 'user_course_progress';

Page({
  data: {
    pathId: '',
    isUnlocked: true,
    path: {},
    courseItems: [],
    taskItems: [],
    pathIntro: '',
    isG3Stage: false
  },

  onLoad(options) {
    this.setData({ pathId: options.id });
    this.loadPath();
  },

  onShow() {
    this.loadPath();
  },

  /** 加载路径数据：分组课程/演练 */
  loadPath() {
    const { pathId } = this.data;
    const path = LearningData.getPath(pathId);
    if (!path) return;

    const progressMap = wx.getStorageSync(PATH_PROGRESS_KEY) || {};
    const courseProgress = wx.getStorageSync(COURSE_PROGRESS_KEY) || {};

    const enrichTask = (item) => {
      const key = `${pathId}:${item.id}`;
      const prog = progressMap[key] || {};
      const isCompleted = !!(prog.hasSubmission && prog.isOfflinePassed);
      let statusText = '未开始';
      if (isCompleted) statusText = '已完成（自记）';
      else if (prog.hasSubmission) statusText = '待个人确认';
      else if (prog.isOfflinePassed) statusText = '个人已确认';
      return { ...item, ...prog, isCompleted, statusText };
    };

    const enrichCourse = (item) => {
      const prog = courseProgress[item.courseId] || {};
      const learned = !!prog.isLearned;
      const quizScore = prog.quizScore || 0;
      const completed = learned && quizScore >= 80;
      return {
        ...item,
        pathCode: path.code,
        statusText: completed ? '已完成' : learned ? '学习中' : '未开始',
        isCompleted: completed
      };
    };

    const courseItems = path.items.filter(i => i.type === 'course').map(enrichCourse);
    const taskItems = path.items.filter(i => i.type === 'task').map(enrichTask);
    const pathIntro = LearningData.getPathIntro(pathId) || '';
    const isPathDone = (pid) => LearningData.isPathGroupCompleted(pid, progressMap);
    const isUnlocked = MemberLevel.isStageUnlocked(path.stageId, progressMap, isPathDone);

    wx.setNavigationBarTitle({ title: path.code });
    this.setData({
      path,
      courseItems,
      taskItems,
      pathIntro,
      isG3Stage: path.stageId === 'G3',
      isUnlocked
    });
  },

  onOpenCourse(e) {
    const courseId = e.currentTarget.dataset.courseId;
    wx.navigateTo({ url: `/pages/learn/course/course?id=${courseId}` });
  },

  /** 跳转提交资料页 */
  onSubmit(e) {
    if (!this.data.isUnlocked) {
      wx.showToast({ title: '阶段未解锁', icon: 'none' });
      return;
    }
    const itemId = e.currentTarget.dataset.itemId;
    wx.navigateTo({
      url: `/pages/learn/submit/submit?pathId=${this.data.pathId}&itemId=${itemId}`
    });
  },

  onPrepare(e) {
    if (!this.data.isUnlocked) return;
    const item = this.data.taskItems.find(t => t.id === e.currentTarget.dataset.itemId);
    if (!item) return;
    let projectId = Storage.getProjects().find(p => {
      const source = (Storage.getProject(p.id) || {}).learnSource;
      return source && source.pathId === this.data.pathId && source.itemId === item.id;
    });
    projectId = projectId && projectId.id;
    if (!projectId) {
      projectId = Storage.createProject(item.project);
      Storage.saveProjectData(projectId, { learnSource: {
        pathId: this.data.pathId, itemId: item.id, pathCode: this.data.path.code,
        requirement: item.requirement, duration: item.duration
      } });
    }
    wx.navigateTo({ url: `/pages/index/index?id=${projectId}` });
  },

  onMarkOffline(e) {
    if (!this.data.isUnlocked) return;
    const itemId = e.currentTarget.dataset.itemId;
    const key = `${this.data.pathId}:${itemId}`;
    const progressMap = wx.getStorageSync(PATH_PROGRESS_KEY) || {};
    const prog = progressMap[key] || {};
    if (!prog.hasSubmission) {
      wx.showToast({ title: '请先提交资料', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '记录线下完成',
      content: '此操作仅记录个人完成情况，不代表俱乐部正式审核。确认已在线下完成该项目？',
      success: (res) => {
        if (res.confirm) {
          progressMap[key] = { ...prog, isOfflinePassed: true, isCompleted: true, updatedAt: Date.now() };
          wx.setStorageSync(PATH_PROGRESS_KEY, progressMap);
          wx.showToast({ title: '已标记通过', icon: 'success' });
          this.loadPath();
        }
      }
    });
  },

  /** 进入导师认证中心 */
  onGoToCert() {
    wx.navigateTo({ url: '/pages/cert/home/home' });
  },

  onFollowOfficialAccount() {
    openOfficialAccount();
  }
});
