// pages/cert/checklist/checklist.js — 导师认证清单

const LearningData = require('../../../utils/learningData');



const CERT_KEY = 'user_cert_progress';



/** 认证清单项（对齐 G3 手册导师认证说明） */

const CHECKLIST = [

  { id: 'g3-required', title: '完成 G3 全部必修路径', desc: 'G3V1~G3V4 课程学习与线下演练均已完成', type: 'auto' },

  { id: 'workshop', title: '完成认证工作坊', desc: '选修 G3X1：任选演讲知识，线下安排工作坊，综合评分≥80', type: 'manual' },

  { id: 'mentor-review', title: '导师评审通过', desc: '由教育副主席或指定导师现场评审并签字确认', type: 'manual' },

  { id: 'cert-apply', title: '提交认证申请', desc: '向俱乐部运营团队提交认证材料，领取导师证书', type: 'manual' }

];



Page({

  data: {

    items: [],

    allDone: false

  },



  onShow() {

    this.loadChecklist();

  },



  /** 加载清单并计算自动项完成状态 */

  loadChecklist() {

    const pathMap = wx.getStorageSync('user_path_progress') || {};

    const certMap = wx.getStorageSync(CERT_KEY) || {};



    const g3Done = LearningData.getRequiredPathsByStage('G3').every(

      p => LearningData.isPathGroupCompleted(p.id, pathMap)

    );



    const items = CHECKLIST.map(item => {

      let done = false;

      if (item.id === 'g3-required') done = g3Done;

      else done = !!certMap[item.id];

      return { ...item, done };

    });



    this.setData({

      items,

      allDone: items.every(i => i.done)

    });

  },



  /** 手动标记非自动项（工作坊/评审/申请） */

  onToggleItem(e) {

    const id = e.currentTarget.dataset.id;

    const item = CHECKLIST.find(i => i.id === id);

    if (!item || item.type === 'auto') return;



    const certMap = wx.getStorageSync(CERT_KEY) || {};

    certMap[id] = !certMap[id];

    wx.setStorageSync(CERT_KEY, certMap);

    this.loadChecklist();



    if (certMap[id]) {

      wx.showToast({ title: '已标记完成', icon: 'success' });

    }

  },



  onGoWorkshop() {

    wx.navigateTo({ url: '/pages/cert/workshop/workshop' });

  },



  onGoResult() {

    wx.navigateTo({ url: '/pages/cert/result/result' });

  }

});

