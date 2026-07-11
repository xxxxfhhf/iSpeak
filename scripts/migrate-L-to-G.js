/**
 * 一次性：将学习路径相关文件中的 L1/L2/L3 重命名为 G1/G2/G3
 * 手册 V5：沟通力体系用 G，L 预留给领导力路径（开发中）
 */
const fs = require('fs');
const path = require('path');

function migrate(s) {
  return s.replace(/L([123])/g, 'G$1');
}

const files = [
  'utils/learning/pathStructure.js',
  'utils/learning/pathIntro.js',
  'utils/learning/l1Courses.js',
  'utils/learning/l2Courses.js',
  'utils/learning/l3Courses.js',
  'utils/learning/courseContents/l1.js',
  'utils/learning/courseContents/l2.js',
  'utils/learning/courseContents/l3.js',
  'utils/learning/courseDraft.js',
  'utils/learning/courseImages.js',
  'utils/learningData.js',
  'utils/memberLevel.js',
  'utils/learning/certIntro.js',
  'pages/learn/home/home.js',
  'pages/learn/home/home.wxml',
  'pages/learn/stage/stage.js',
  'pages/learn/path/path.js',
  'pages/learn/path/path.wxml',
  'pages/cert/home/home.wxml',
  'pages/cert/checklist/checklist.js',
  'pages/cert/checklist/checklist.wxml',
  'pages/cert/workshop/workshop.js',
  'pages/cert/workshop/workshop.wxml',
  'pages/role/agenda/edit/edit.wxml'
];

const root = path.join(__dirname, '..');
for (const f of files) {
  const p = path.join(root, f);
  if (!fs.existsSync(p)) {
    console.log('MISS', f);
    continue;
  }
  const old = fs.readFileSync(p, 'utf8');
  const neu = migrate(old);
  if (old === neu) console.log('SAME', f);
  else {
    fs.writeFileSync(p, neu, 'utf8');
    console.log('OK', f);
  }
}
