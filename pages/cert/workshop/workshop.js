// pages/cert/workshop/workshop.js — G3X1 导师认证工作坊规划

Page({

  data: {

    goal: '',

    topic: '',

    date: '',

    score: ''

  },



  onGoalInput(e) { this.setData({ goal: e.detail.value }); },

  onTopicInput(e) { this.setData({ topic: e.detail.value }); },

  onDateChange(e) { this.setData({ date: e.detail.value }); },

  onScoreInput(e) { this.setData({ score: e.detail.value }); },



  /** 保存 SMART 规划到本地 */

  onSave() {

    const { goal, topic, date, score } = this.data;

    if (!goal.trim() || !topic.trim()) {

      wx.showToast({ title: '请填写目标与主题', icon: 'none' });

      return;

    }

    wx.setStorageSync('user_workshop_plan', {

      goal: goal.trim(),

      topic: topic.trim(),

      date,

      score: score.trim(),

      updatedAt: Date.now()

    });

    wx.showToast({ title: '规划已保存', icon: 'success' });

  }

});

