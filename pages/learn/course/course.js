// pages/learn/course/course.js
const LearningData = require('../../../utils/learningData.js');
const { parseCourseContent, enrichBlocks, enrichBlocksWithInline } = require('../../../utils/learning/contentParser.js');
const { getCourseImageMap } = require('../../../utils/learning/courseImages.js');
const { getCourseDraftConfig, startDraftFromCourse, buildAiFragment } = require('../../../utils/learning/courseDraft.js');
const { openOfficialAccount } = require('../../../utils/clubFollow.js');

const PROGRESS_KEY = 'user_course_progress';

Page({
  data: {
    courseId: '',
    course: {},
    contentBlocks: [],
    courseImages: [],
    previewUrls: [],
    hasQuiz: false,
    quizScore: 0,
    quizPassed: false,
    isLearned: false,
    draftConfig: {}
  },

  onLoad(options) {
    this.setData({ courseId: options.id });
    this._skipNextShow = true;
    this.loadCourse();
  },

  onShow() {
    if (this._skipNextShow) {
      this._skipNextShow = false;
      return;
    }
    this.loadCourse();
  },

  loadCourse() {
    const { courseId } = this.data;
    const course = LearningData.getCourse(courseId);
    if (!course) {
      wx.showToast({ title: '课程不存在', icon: 'none' });
      return;
    }

    const map = wx.getStorageSync(PROGRESS_KEY) || {};
    const prog = map[courseId] || {};
    const quizScore = prog.quizScore || 0;
    const hasQuiz = !!(course.quiz && course.quiz.length);

    const imageMap = getCourseImageMap(courseId);
    const courseImages = LearningData.getCourseImages(courseId);
    const previewUrls = courseImages.map(i => i.path).filter(Boolean);

    let blocks = enrichBlocks(parseCourseContent(course.courseContent), 'course');
    blocks = enrichBlocksWithInline(blocks, imageMap);

    const draftConfig = getCourseDraftConfig(courseId);
    const isLearned = !!prog.isLearned;
    const quizPassed = quizScore >= 80;

    wx.setNavigationBarTitle({ title: course.title });
    this.setData({
      course,
      contentBlocks: blocks,
      courseImages,
      previewUrls,
      hasQuiz,
      quizScore,
      quizPassed,
      isLearned,
      draftConfig
    });
  },

  /** 打开外链（webview 页；未配置业务域名时复制链接） */
  onOpenLink(e) {
    const url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: `/pages/learn/webview/webview?url=${encodeURIComponent(url)}`,
      fail: () => {
        wx.setClipboardData({
          data: url,
          success: () => wx.showToast({ title: '链接已复制', icon: 'success' })
        });
      }
    });
  },

  /** 预览手册配图 */
  onPreviewImage(e) {
    const src = e.currentTarget.dataset.src;
    const { previewUrls } = this.data;
    if (!src) {
      wx.showToast({ title: '手册配图待导入', icon: 'none' });
      return;
    }
    wx.previewImage({
      current: src,
      urls: previewUrls.length ? previewUrls : [src],
      fail: () => wx.showToast({ title: '图片加载失败', icon: 'none' })
    });
  },

  onStartQuiz() {
    wx.navigateTo({ url: `/pages/learn/quiz/quiz?courseId=${this.data.courseId}` });
  },

  onMarkLearned() {
    const { courseId, quizScore } = this.data;
    const map = wx.getStorageSync(PROGRESS_KEY) || {};
    map[courseId] = {
      ...(map[courseId] || {}),
      isLearned: true,
      isCompleted: quizScore >= 80,
      updatedAt: Date.now()
    };
    wx.setStorageSync(PROGRESS_KEY, map);
    wx.showToast({ title: '已标记学习', icon: 'success' });
    this.loadCourse();
  },

  /** 按课程映射模板直接创建写稿项目 */
  onStartDraft() {
    if (this._draftNavigating) return;
    const { course } = this.data;
    const projectId = startDraftFromCourse(course);
    if (!projectId) {
      wx.showToast({ title: '创建失败', icon: 'none' });
      return;
    }
    this._draftNavigating = true;
    // 与 templates 页一致用 redirectTo，避免页面栈过深触发框架计时异常
    wx.redirectTo({
      url: `/pages/index/index?id=${projectId}`,
      fail: () => {
        this._draftNavigating = false;
        wx.showToast({ title: '跳转失败', icon: 'none' });
      },
      complete: () => {
        this._draftNavigating = false;
      }
    });
  },

  /** 带模板与练习目标进入 AI 向导（大文本走 Storage，避免 URL 过长） */
  onStartAiDraft() {
    if (this._wizardNavigating) return;
    const { course, draftConfig } = this.data;
    const fragment = buildAiFragment(course);
    if (fragment) {
      wx.setStorageSync('wizard_init_content', fragment);
    }
    wx.setStorageSync('wizard_course_init', {
      templateId: draftConfig.templateId,
      goal: course.practiceGoal || course.title || '',
      audience: '俱乐部会员与来宾',
      autoStep: 3
    });
    this._wizardNavigating = true;
    wx.navigateTo({
      url: '/pages/wizard/wizard?fromCourse=1',
      fail: () => {
        this._wizardNavigating = false;
        wx.removeStorageSync('wizard_course_init');
        wx.showToast({ title: '跳转失败', icon: 'none' });
      },
      complete: () => {
        this._wizardNavigating = false;
      }
    });
  },

  /** 关注公众号 */
  onFollowOfficialAccount() {
    openOfficialAccount();
  }
});
