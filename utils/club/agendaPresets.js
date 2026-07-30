/**
 * 议程预设 — 677标准 / 678马拉松 / 681工作坊 / 即兴专场 / 备稿专场
 */
const {
  createBlock,
  defaultRoleIntroBlocks,
  defaultPreparedSpeeches,
  defaultEvalBlocks,
  defaultClosingBlocks
} = require('./agendaBlocks.js');

function buildBaseBlocks(options = {}) {
  const blocks = [
    createBlock('reception', { role: '接待官', duration: 10 }),
    createBlock('opening', { role: '会议主席', duration: 5 }),
    createBlock('role_intro_section', { enabled: true }),
    ...defaultRoleIntroBlocks()
  ];
  return blocks;
}

/** 677 标准例会：即兴 + 备稿×3 */
function presetStandard() {
  const blocks = buildBaseBlocks();
  blocks.push(
    createBlock('table_topics_section', { enabled: true }),
    createBlock('table_topics_speech', { role: '即兴主持', duration: 25, note: '每人1-2mins' }),
    createBlock('prepared_section', { enabled: true }),
    ...defaultPreparedSpeeches(3),
    createBlock('break', { role: '拍照官', duration: 5, note: '合影、交流' }),
    createBlock('eval_section', { enabled: true }),
    ...defaultEvalBlocks(true, 3),
    createBlock('closing_section', { enabled: true }),
    ...defaultClosingBlocks()
  );
  return {
    presetId: 'standard',
    presetName: '标准例会（677）',
    meetingStart: '19:30',
    meetingEnd: '21:30',
    blocks
  };
}

/** 678 演讲马拉松：仅备稿×6 */
function presetMarathon() {
  const blocks = buildBaseBlocks();
  blocks.push(
    createBlock('prepared_section', { enabled: true }),
    ...defaultPreparedSpeeches(6),
    createBlock('break', { role: '拍照官', duration: 10 }),
    createBlock('eval_section', { enabled: true }),
    ...defaultEvalBlocks(false, 6),
    createBlock('closing_section', { enabled: true }),
    ...defaultClosingBlocks().slice(0, 2)
  );
  return {
    presetId: 'marathon',
    presetName: '演讲马拉松（678）',
    meetingStart: '19:30',
    meetingEnd: '21:30',
    blocks
  };
}

/** 681 工作坊场：备稿×2 + 工作坊（无即兴，可再手动打开即兴积木） */
function presetWorkshop() {
  const blocks = buildBaseBlocks();
  blocks.push(
    createBlock('prepared_section', { enabled: true }),
    ...defaultPreparedSpeeches(2),
    createBlock('workshop_section', { enabled: true }),
    createBlock('workshop', { title: '演讲知识工作坊', role: '工作坊讲师', duration: 30 }),
    createBlock('break', { role: '拍照官', duration: 5 }),
    createBlock('eval_section', { enabled: true }),
    ...defaultEvalBlocks(false, 2),
    createBlock('closing_section', { enabled: true }),
    ...defaultClosingBlocks()
  );
  return {
    presetId: 'workshop',
    presetName: '工作坊场（681）',
    meetingStart: '19:30',
    meetingEnd: '21:30',
    blocks
  };
}

function presetTableTopicsOnly() {
  const blocks = buildBaseBlocks();
  blocks.push(
    createBlock('table_topics_section', { enabled: true }),
    createBlock('table_topics_speech', { duration: 40 }),
    createBlock('eval_section', { enabled: true }),
    createBlock('eval_table_topics', { duration: 15 }),
    createBlock('eval_timer', { duration: 2 }),
    createBlock('eval_general', { duration: 10 }),
    createBlock('closing_section', { enabled: true }),
    ...defaultClosingBlocks().slice(0, 2)
  );
  return { presetId: 'impromptu', presetName: '即兴专场', meetingStart: '19:30', meetingEnd: '21:30', blocks };
}

function presetPreparedOnly() {
  const blocks = buildBaseBlocks();
  blocks.push(
    createBlock('prepared_section', { enabled: true }),
    ...defaultPreparedSpeeches(3),
    createBlock('break', { duration: 5 }),
    createBlock('eval_section', { enabled: true }),
    ...defaultEvalBlocks(false, 3),
    createBlock('closing_section', { enabled: true }),
    ...defaultClosingBlocks()
  );
  return { presetId: 'prepared', presetName: '备稿专场', meetingStart: '19:30', meetingEnd: '21:30', blocks };
}

const PRESETS = [
  { id: 'standard', name: '标准例会', desc: '即兴+备稿×3' },
  { id: 'marathon', name: '演讲马拉松', desc: '备稿×6' },
  { id: 'workshop', name: '工作坊场', desc: '备稿+工作坊' },
  { id: 'impromptu', name: '即兴专场', desc: '仅即兴' },
  { id: 'prepared', name: '备稿专场', desc: '仅备稿' },
  { id: 'blank', name: '空白', desc: '从零搭建' }
];

function getPreset(presetId) {
  const meta = {
    meetingNo: '',
    theme: '',
    themeWords: '',
    meetingDate: '',
    location: '',
    receptionStart: '19:20'
  };
  let data;
  switch (presetId) {
    case 'standard': data = presetStandard(); break;
    case 'marathon': data = presetMarathon(); break;
    case 'workshop': data = presetWorkshop(); break;
    case 'impromptu': data = presetTableTopicsOnly(); break;
    case 'prepared': data = presetPreparedOnly(); break;
    default:
      data = { presetId: 'blank', presetName: '空白议程', meetingStart: '19:30', meetingEnd: '21:30', blocks: buildBaseBlocks() };
  }
  return { ...meta, ...data };
}

module.exports = { PRESETS, getPreset };
