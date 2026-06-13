// pages/learn/search/search.js
const LearningData = require('../../../utils/learningData');

Page({
  data: {
    keyword: '',
    courseResults: [],
    pathResults: []
  },

  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    this.doSearch(keyword);
  },

  doSearch(keyword) {
    const { courses, paths } = LearningData.searchContent(keyword);
    this.setData({ courseResults: courses, pathResults: paths });
  },

  onCourseTap(e) {
    wx.navigateTo({ url: `/pages/learn/course/course?id=${e.currentTarget.dataset.id}` });
  },

  onPathTap(e) {
    const item = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/learn/path/path?id=${item.pathId}` });
  }
});
