/**
 * 课程配图 — 对应手册 PDF 中的「图1」「图一」等
 * 图片文件位于 assets/learning/{courseId}/ 目录，可由 scripts/extract-course-images.js 从 PDF 导出
 */
const COURSE_IMAGES = {
  'G2X1-C2': [
    { ref: '图1', caption: 'iSlide PPT模板筛选页面', path: '/assets/learning/G2X1-C2/fig1.png' },
    { ref: '图2', caption: '亲密性原则运用与反面示例', path: '/assets/learning/G2X1-C2/fig2.png' },
    { ref: '图3', caption: '菜单对齐示例', path: '/assets/learning/G2X1-C2/fig3.png' },
    { ref: '图4', caption: '优化后效果', path: '/assets/learning/G2X1-C2/fig4.png' },
    { ref: '图5', caption: 'WPS SmartArt 和智能图形', path: '/assets/learning/G2X1-C2/fig5.png' },
    { ref: '图6', caption: '亲密性课后练习', path: '/assets/learning/G2X1-C2/fig6.png' },
    { ref: '图7', caption: '居中对齐与左对齐效果', path: '/assets/learning/G2X1-C2/fig7.png' },
    { ref: '图8', caption: '对齐课后练习', path: '/assets/learning/G2X1-C2/fig8.png' },
    { ref: '图9', caption: 'PPT 风格统一示例', path: '/assets/learning/G2X1-C2/fig9.png' },
    { ref: '图11', caption: '重复原则运用', path: '/assets/learning/G2X1-C2/fig11.png' }
  ],
  'G3X3-C1': [
    { ref: '图一', caption: '动物沟通模型', path: '/assets/learning/G3X3-C1/fig1.png' }
  ]
};

function getCourseImages(courseId) {
  return COURSE_IMAGES[courseId] || [];
}

function getCourseImageMap(courseId) {
  const map = {};
  getCourseImages(courseId).forEach(img => {
    map[img.ref] = img;
  });
  return map;
}

module.exports = { COURSE_IMAGES, getCourseImages, getCourseImageMap };
