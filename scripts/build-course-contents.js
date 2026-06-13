/**
 * 从 PDF 提取文本解析为课程对象，输出 courseContents/*.js
 */
const fs = require('fs');
const path = require('path');

const PDF_DIR = path.join(__dirname, 'pdf-text');
const OUT_DIR = path.join(__dirname, '..', 'utils', 'learning', 'courseContents');

/** 清理页眉页脚等 PDF 噪音 */
function cleanText(text) {
  return text
    .replace(/i演讲•演讲晋级手册/g, '')
    .replace(/I演讲俱乐部演讲晋级手册/g, '')
    .replace(/I演讲厦门演讲俱乐部晋级手册/g, '')
    .replace(/第\s*\n\s*\d+\s*\n\s*页/g, '')
    .replace(/第\d+页/g, '')
    .replace(/第\s+0\s+页/g, '')
    .replace(/微信扫码[^\n]*/g, '')
    .replace(/扫码获取教程资料/g, '')
    .replace(/百度网盘APP[^\n]*/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** 合并被 PDF 拆开的行 */
function joinLines(text) {
  const lines = text.split('\n');
  const out = [];
  let buf = '';
  const isHeading = (s) => /^L\d[VX]\d/.test(s) || /^【/.test(s) || /^一、|^二、|^三、|^四、|^五、/.test(s);
  const isPageNoise = (s) => !s.trim() || /^第$/.test(s) || /^\d+$/.test(s.trim()) && s.trim().length < 3;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (isPageNoise(line)) continue;
    if (isHeading(line)) {
      if (buf) { out.push(buf.trim()); buf = ''; }
      out.push(line);
      continue;
    }
    if (!buf) {
      buf = line;
    } else if (line.length <= 2 && !/[。！？；：]$/.test(buf)) {
      buf += line;
    } else if (/[，、：；]$/.test(buf) || (!/[。！？]$/.test(buf) && line.length < 40)) {
      buf += line;
    } else {
      out.push(buf.trim());
      buf = line;
    }
  }
  if (buf) out.push(buf.trim());
  return out.join('\n');
}

/** 定位正文中的章节标题（跳过目录页重复标题） */
function findSectionStart(fullText, startPattern) {
  const reStart = new RegExp(startPattern, 'gi');
  let m;
  while ((m = reStart.exec(fullText)) !== null) {
    const snippet = fullText.slice(m.index, m.index + 400);
    if (/【学习内容】/.test(snippet)) return m.index;
  }
  return -1;
}

function extractSection(fullText, startPattern, endPattern) {
  const start = findSectionStart(fullText, startPattern);
  if (start < 0) return '';
  let end = fullText.length;
  if (endPattern) {
    const rest = fullText.slice(start + 1);
    const reEnd = new RegExp(endPattern, 'i');
    const em = rest.match(reEnd);
    if (em) end = start + 1 + em.index;
  }
  return cleanText(joinLines(fullText.slice(start, end)));
}

function parseFields(sectionText) {
  // 去掉章节标题行
  const body = (sectionText || '').replace(/^L\d[VX]\d[^\n【]*\n?/, '').trim();
  const learn = body.match(/【学习内容】[：:]?\s*([\s\S]*?)(?=【练习目标】|【课程内容】)/);
  const practice = body.match(/【练习目标】[：:]?\s*([\s\S]*?)(?=【课程内容】)/);
  const course = body.match(/【课程内容】[：:]?\s*([\s\S]*?)(?=【小提示】|必须路径|必修路径|选修路径|—第|微信扫码|$)/);

  return {
    learnContent: learn ? learn[1].trim() : '',
    practiceGoal: practice ? practice[1].trim() : '',
    courseContent: course ? course[1].trim() : ''
  };
}

function extractTitle(sectionText, fallback) {
  const m = sectionText.match(/^(L\d[VX]\d)[、.]\s*([^\n【]+)/);
  if (m) return m[2].trim();
  return fallback;
}

/** 基于内容生成 3 道测验题（规则提取关键词） */
function buildQuiz(id, learn, course, practice) {
  const pool = learn + course + practice;
  const quizzes = {
    'L1V1-COURSE': [
      { q: '有效自我介绍首先要搞清楚？', options: ['自己的名字', '听众是谁', 'PPT内容', '演讲时长'], answer: 1 },
      { q: '自我介绍的目的层次不包括？', options: ['触动听众', '让听众做决定', '让听众马上行动', '背诵简历'], answer: 3 },
      { q: '本路径建议自我介绍时长？', options: ['2-3分钟', '5-7分钟', '10分钟', '1分钟'], answer: 0 }
    ],
    'L1V2-COURSE': [
      { q: 'PEEP 结构中第二个 E 代表？', options: ['解释', '例子', '结尾', '情绪'], answer: 1 },
      { q: '金字塔结构的原则是？', options: ['结论先行', '故事先行', '数据先行', '幽默先行'], answer: 0 },
      { q: '黄金圈结构的顺序是？', options: ['What-How-Why', 'Why-How-What', 'How-Why-What', 'Why-What-How'], answer: 1 }
    ],
    'L1V3-COURSE': [
      { q: '英雄之旅中「遇见导师」的作用是？', options: ['结束故事', '协助克服困难', '制造悬念', '替换主人公'], answer: 1 },
      { q: '故事基本要素不包括？', options: ['人物', '背景', '悬念', 'PPT动画'], answer: 3 },
      { q: '好故事必须有什么？', options: ['多个观点', '冲突与价值变化', '大量数据', '幽默段子'], answer: 1 }
    ],
    'L1V4-COURSE': [
      { q: '三明治点评法的中间层是？', options: ['赞美', '建议', '鼓励', '批评'], answer: 1 },
      { q: '内容点评中观点应该？', options: ['越多越好', '一条且有价值', '不必明确', '只讲感悟'], answer: 1 },
      { q: '对新手点评应？', options: ['赞美多建议少', '只挑毛病', '不点评', '只讲理论'], answer: 0 }
    ],
    'L1X1-COURSE': [
      { q: '开场应避免的误区？', options: ['开门见山', '过多客套话', '提问互动', '震撼数据'], answer: 1 },
      { q: '五种开场方式不包括？', options: ['熟悉的内容', '震撼数据', '朗读全文', '提问互动'], answer: 2 },
      { q: '本路径演讲建议时长？', options: ['2-3分钟', '5-7分钟', '15分钟', '30秒'], answer: 1 }
    ],
    'L1X2-COURSE': [
      { q: '正文部分建议最多讲几个点？', options: ['1个', '3个', '10个', '不限'], answer: 1 },
      { q: '具体化描写可从什么出发？', options: ['五感', '只有视觉', '只有听觉', '统计数据'], answer: 0 },
      { q: '重复技巧的作用是？', options: ['拖时间', '强化核心观点', '凑字数', '代替结构'], answer: 1 }
    ],
    'L1X3-COURSE': [
      { q: '结尾「送出礼物」可以是？', options: ['金句或忠告', '新话题', '长篇问答', '自我介绍'], answer: 0 },
      { q: '结尾应避开的坑？', options: ['点题升华', '不点题背离目标', '重复排比', '呼吁行动'], answer: 1 },
      { q: '说服性演讲结尾应？', options: ['突然结束', '呼吁行动', '只讲笑话', '不提观点'], answer: 1 }
    ],
    'L2V1-C1': [
      { q: '腹式呼吸的判断标准是？', options: ['胸部起伏', '腹部起伏', '肩膀起伏', '不呼吸'], answer: 1 },
      { q: '「顿」在声音变化中指？', options: ['加快语速', '适当停顿', '提高音调', '大声喊叫'], answer: 1 },
      { q: '声音练习主要有哪两个方面？', options: ['呼吸和声音变化', '服装和化妆', 'PPT和灯光', '稿子和记忆'], answer: 0 }
    ],
    'L2V1-C2': [
      { q: '克服紧张的技巧不包括？', options: ['不断练习', '思想实验', '礼物心态', '避免上台'], answer: 3 },
      { q: '手势常放置区域是？', options: ['高能区（肩以上）', '中能区（腰-肩）', '低能区（腰以下）', '背后'], answer: 1 },
      { q: '舞台呈现的核心目的是？', options: ['辅助传达思想', '模仿他人', '频繁走动', '不用准备'], answer: 0 }
    ],
    'L2V2-COURSE': [
      { q: '阅读分享中书中内容占比应？', options: ['不少于40%', '不超过10%', '不需要引用', '100%朗诵'], answer: 0 },
      { q: '分享内容应包含？', options: ['新知观点+案例+金句', '只推荐书名', '全文摘抄', '只有感悟'], answer: 0 },
      { q: '「教是最好的学」指？', options: ['只阅读不分享', '阅读分享是更高效学习', '不用读书', '只写笔记'], answer: 1 }
    ],
    'L2X1-C1': [
      { q: 'HEAR 中 H 代表？', options: ['幽默', '诚实', '帮助', '倾听'], answer: 1 },
      { q: 'A（自主）的核心是？', options: ['替对方做决定', '让对方自己选择是否改变', '不给建议', '强制要求'], answer: 1 },
      { q: 'R（反馈）技巧不包括？', options: ['重复关键词', '放大优点', '争论对错', '引导思考'], answer: 2 }
    ],
    'L2X1-C2': [
      { q: 'PPT 设计四大原则不包括？', options: ['亲密性', '对齐', '重复', '随机性'], answer: 3 },
      { q: '本路径演讲建议时长？', options: ['2-3分钟', '8-10分钟', '30分钟', '1分钟'], answer: 1 },
      { q: '用好模板的关键是？', options: ['从不练习', '大量练习', '只用一种模板', '不用模板'], answer: 1 }
    ],
    'L3V1-COURSE': [
      { q: '幽默公式是？', options: ['铺垫+反转', '只有笑话', '越长越好', '模仿他人'], answer: 0 },
      { q: '优越感原理常通过什么实现？', options: ['攻击他人', '自嘲', '讽刺听众', '政治话题'], answer: 1 },
      { q: '幽默设计应避免？', options: ['服务演讲目的', '为幽默而幽默', '铺垫', '反转'], answer: 1 }
    ],
    'L3V2-COURSE': [
      { q: '说服演讲首先要？', options: ['明确目标', '讲笑话', '越长越好', '不用结构'], answer: 0 },
      { q: '影响力原则不包括？', options: ['互惠', '稀缺', '对比', '强迫'], answer: 3 },
      { q: '说服性演讲结构可采用？', options: ['PREP', '只有故事', '无结构', '只讲数据'], answer: 0 }
    ],
    'L3V3-COURSE': [
      { q: '社交演讲常用结构是？', options: ['感谢+回顾+祝福', '只有感谢', 'PRS', 'PEEP'], answer: 0 },
      { q: 'PRS 中 S 代表？', options: ['问题', '原因', '解决方案', '情景'], answer: 2 },
      { q: 'SCQA 中 C 代表？', options: ['冲突/困难', '结论', '案例', '对比'], answer: 0 }
    ],
    'L3X1-COURSE': [
      { q: 'SMART 中 M 代表？', options: ['可衡量', '动机', '方法', '管理'], answer: 0 },
      { q: '具体化目标可运用？', options: ['5W1H', '只有What', '随机设定', '不设时间'], answer: 0 },
      { q: '本选修与什么相关？', options: ['导师认证', '破冰演讲', 'PPT设计', '即兴演讲'], answer: 0 }
    ],
    'L3X2-COURSE': [
      { q: '演讲开头提问的作用是？', options: ['热场吸引兴趣', '拖长演讲', '代替正文', '结束演讲'], answer: 0 },
      { q: '提问注意事项包括？', options: ['避免审问式连问', '越多越好', '放在最后', '必须让听众回答'], answer: 0 },
      { q: '演讲过程与提问的关系是？', options: ['演讲是问题的解答过程', '提问与主题无关', '只问封闭式问题', '不用提问'], answer: 0 }
    ],
    'L3X3-C1': [
      { q: '「狮子」风格适合？', options: ['领导力场景', '只有亲密场景', '只有冲突', '从不使用'], answer: 0 },
      { q: '「霸王龙」主要用于？', options: ['应对冲突', '婚礼感言', '阅读分享', '破冰演讲'], answer: 0 },
      { q: '沟通风格的选择应？', options: ['因场景而异', '永远只用一种', '完全模仿他人', '忽略风格'], answer: 0 }
    ],
    'L3X3-C2': [
      { q: '合作式语言应多使用？', options: ['你/我们', '只有我', '命令句', '专业术语'], answer: 0 },
      { q: '接纳式沟通要？', options: ['放弃否定和对抗', '只批评', '不倾听', '回避观点'], answer: 0 },
      { q: '建立联系的目的是？', options: ['提升说服力', '减少内容', '不用准备', '只讲数据'], answer: 0 }
    ]
  };
  return quizzes[id] || [
    { q: '本课程的学习内容主要关于？', options: ['演讲技巧', ' unrelated', '无关内容', '随机话题'], answer: 0 },
    { q: '练习目标要求？', options: ['线下实战演练', '只看不练', '无需准备', '跳过课程'], answer: 0 },
    { q: '课程内容来自？', options: ['晋级手册', '网络段子', '随意编造', '无来源'], answer: 0 }
  ];
}

function escJs(str) {
  return (str || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r\n/g, '\\n')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\n');
}

function makeCourse(id, stageId, title, sectionText, quizId) {
  const fields = parseFields(sectionText);
  return {
    id,
    stageId,
    title: title || extractTitle(sectionText, id),
    learnContent: fields.learnContent,
    courseContent: fields.courseContent,
    practiceGoal: fields.practiceGoal,
    quiz: buildQuiz(quizId || id, fields.learnContent, fields.courseContent, fields.practiceGoal)
  };
}

function toJsModule(courses, stageLabel) {
  const lines = courses.map(c => {
    const quizStr = JSON.stringify(c.quiz, null, 2).replace(/\n/g, '\n  ');
    return `  {
    id: '${c.id}',
    stageId: '${c.stageId}',
    title: '${escJs(c.title)}',
    learnContent: '${escJs(c.learnContent)}',
    courseContent: '${escJs(c.courseContent)}',
    practiceGoal: '${escJs(c.practiceGoal)}',
    quiz: ${quizStr}
  }`;
  });
  return `/**
 * ${stageLabel} 课程完整正文 — 来源：厦门演讲俱乐部晋级手册 PDF
 * 字段：learnContent=学习内容，courseContent=课程内容，practiceGoal=练习目标
 */
const COURSES = [
${lines.join(',\n')}
];

module.exports = { COURSES };
`;
}

// --- L1 ---
const l1Text = fs.readFileSync(path.join(PDF_DIR, '厦门演讲俱乐部L1晋级手册-A5V4.txt'), 'utf8');
const l1Clean = cleanText(l1Text);

const l1Sections = [
  ['L1V1-COURSE', 'L1', '做好有效的自我介绍', /L1V1、做好有效的自我介绍/, /L1V2、演讲结构课程/],
  ['L1V2-COURSE', 'L1', '演讲结构课程', /L1V2、演讲结构课程/, /L1V3、如何讲好一个故事/],
  ['L1V3-COURSE', 'L1', '如何讲好一个故事', /L1V3、如何讲好一个故事/, /L1V4、点评课程/],
  ['L1V4-COURSE', 'L1', '点评课程', /L1V4、点评课程/, /L1X1、开场：赢得听众的兴趣/],
  ['L1X1-COURSE', 'L1', '开场：赢得听众的兴趣', /L1X1、开场：赢得听众的兴趣/, /L1X2、正文：类比、具体化、重复/],
  ['L1X2-COURSE', 'L1', '正文：类比、具体化、重复，让演讲更生动', /L1X2、正文：类比、具体化、重复/, /L1X3、结尾：如何让演讲深入人心/],
  ['L1X3-COURSE', 'L1', '结尾：如何让演讲深入人心？', /L1X3、结尾：如何让演讲深入人心/, /【小提示】手册仅供理论学习/]
];

const l1Courses = l1Sections.map(([id, stage, title, start, end]) => {
  const sec = extractSection(l1Clean, start.source, end.source);
  return makeCourse(id, stage, title, sec);
});

// --- L2 ---
const l2Text = fs.readFileSync(path.join(PDF_DIR, 'L2演讲晋级手册_A5V4.txt'), 'utf8');
const l2Clean = cleanText(l2Text);

const l2Courses = [
  makeCourse('L2V1-C1', 'L2', '让声音活起来',
    extractSection(l2Clean, /L2V1、让声音活起来/, /L2V1、舞台呈现/)),
  makeCourse('L2V1-C2', 'L2', '舞台呈现',
    extractSection(l2Clean, /L2V1、舞台呈现/, /L2V2、如何做好阅读分享/)),
  makeCourse('L2V2-COURSE', 'L2', '如何做好阅读分享',
    extractSection(l2Clean, /L2V2、如何做好阅读分享/, /L2X1、有效倾听/)),
  makeCourse('L2X1-C1', 'L2', '有效倾听',
    extractSection(l2Clean, /L2X1、有效倾听/, /L2X2、PPT设计基本原则/)),
  makeCourse('L2X1-C2', 'L2', 'PPT设计基本原则：让你在演讲中脱颖而出',
    extractSection(l2Clean, /L2X2、PPT设计基本原则/, /【小提示】手册仅供理论学习/))
];

// --- L3 ---
const l3Text = fs.readFileSync(path.join(PDF_DIR, 'L3演讲晋级手册_A5-2（20251228）.txt'), 'utf8');
const l3Clean = cleanText(l3Text);

const l3Courses = [
  makeCourse('L3V1-COURSE', 'L3', '用幽默，为演讲增添笑点',
    extractSection(l3Clean, /L3V1、用幽默，为演讲增添笑点/, /L3V2、说服性演讲/)),
  makeCourse('L3V2-COURSE', 'L3', '说服性演讲',
    extractSection(l3Clean, /L3V2、说服性演讲/, /L3V3、职场与社交演讲/)),
  makeCourse('L3V3-COURSE', 'L3', '职场与社交演讲',
    extractSection(l3Clean, /L3V3、职场与社交演讲/, /L3X1、目标管理/)),
  makeCourse('L3X1-COURSE', 'L3', '目标管理（导师认证）',
    extractSection(l3Clean, /L3X1、目标管理/, /L3X2、了解听众/)),
  // 手册目录：L3X2=了解听众；正文中「学会提问」误标为 L3X2，按 pathStructure 导出为 L3X2-COURSE
  makeCourse('L3X2-COURSE', 'L3', '学会提问',
    extractSection(l3Clean, /L3X2、学会提问/, /L3X3、沟通风格/)),
  makeCourse('L3X3-C1', 'L3', '沟通风格',
    extractSection(l3Clean, /L3X3、沟通风格/, /L3X3、建立联系/)),
  makeCourse('L3X3-C2', 'L3', '建立联系，让演讲更有说服力',
    extractSection(l3Clean, /L3X3、建立联系/, /【小提示】手册仅供理论学习/))
];

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'l1.js'), toJsModule(l1Courses, 'L1'), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'l2.js'), toJsModule(l2Courses, 'L2'), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'l3.js'), toJsModule(l3Courses, 'L3'), 'utf8');

console.log('L1:', l1Courses.length, 'courses');
console.log('L2:', l2Courses.length, 'courses');
console.log('L3:', l3Courses.length, 'courses');
l1Courses.forEach(c => console.log(' ', c.id, 'learn:', c.learnContent.length, 'course:', c.courseContent.length));
l2Courses.forEach(c => console.log(' ', c.id, 'learn:', c.learnContent.length, 'course:', c.courseContent.length));
l3Courses.forEach(c => console.log(' ', c.id, 'learn:', c.learnContent.length, 'course:', c.courseContent.length));
