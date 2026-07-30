// pages/cert/home/home.js
const LearningData = require('../../../utils/learningData.js');
const { parseCourseContent, enrichBlocks } = require('../../../utils/learning/contentParser.js');
const { openOfficialAccount, ClubConfig } = require('../../../utils/clubFollow.js');

Page({
  data: {
    introBlocks: [],
    dutyBlocks: [],
    mentorBenefits: [],
    showBenefits: true,
    showDuties: false,
    clubFollowHint: '公众号「i演讲」· 视频号「厦门演讲俱乐部」'
  },
  onLoad() {
    this.loadCertIntro();
  },

  /** 加载导师介绍与权益 */
  loadCertIntro() {
    const mentor = LearningData.getMentorIntro() || {};
    const mentorBenefits = LearningData.getMentorBenefits() || [];

    this.setData({
      introBlocks: enrichBlocks(parseCourseContent(mentor.intro), 'certIntro'),
      dutyBlocks: enrichBlocks(parseCourseContent(mentor.duties), 'certDuty'),
      mentorBenefits
    });
  },

  onToggleBenefits() {
    this.setData({ showBenefits: !this.data.showBenefits });
  },

  onToggleDuties() {
    this.setData({ showDuties: !this.data.showDuties });
  },

  onGoChecklist() {
    wx.navigateTo({ url: '/pages/cert/checklist/checklist' });
  },

  onGoWorkshop() {
    wx.navigateTo({ url: '/pages/cert/workshop/workshop' });
  },

  /** 关注俱乐部公众号 */
  onFollowOfficialAccount() {
    openOfficialAccount();
  }
});