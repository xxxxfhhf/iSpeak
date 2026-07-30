/**
 * 导师认证介绍与权益 — 对齐 G3 手册导师认证说明
 */

const MENTOR_INTRO = {
  intro: '完成 G3 全部必修路径并通过导师认证后，你将从「学习者」转变为「带教者」，在俱乐部中承担更多角色，帮助新会员成长。\n\n导师是俱乐部互助文化的核心：你曾走过的路，将成为新会员的灯塔。',
  duties: '【见习导师认证要求】\n1. 完成 G1~G3 所有演讲（或在俱乐部至少持续待 2 年以上，并通过俱乐部所有官员对演讲能力的考核）\n2. 完成 G3V4【题目自拟，主题《我在俱乐部的收获》（故事演讲）】，不能跳过\n3. 完成任意演讲知识 30min 工作坊\n\n【导师主要职责】\n· 协助会员修改演讲稿，解答演讲困惑\n· 见习导师：不安排具体会员；导师/资深导师：安排具体会员并为俱乐部赋能\n· 选修 G3X1：任选演讲知识，线下开展认证工作坊（综合评分≥80）'
};

/** 导师权益对照表：会员 vs 导师 */
const MENTOR_BENEFITS = [
  { item: '演讲晋级手册', member: '√', mentor: '√' },
  { item: '导师带队（带教新会员）', member: '×', mentor: '√（导师起）' },
  { item: '认证工作坊主讲', member: '×', mentor: '√' },
  { item: '导师证书与身份认定', member: '×', mentor: '√' },
  { item: '见习导师会费', member: '980/年', mentor: '半价 490/年' },
  { item: '正式导师会费', member: '980/年', mentor: '免费' },
  { item: '备稿/路径深度点评', member: '学习', mentor: '带领' },
  { item: '俱乐部教育事务参与', member: '有限', mentor: '深度参与' },
  { item: '演讲毕业证书', member: '√', mentor: '√' },
  { item: '场地费', member: '免费', mentor: '免费' }
];

function getMentorIntro() {
  return MENTOR_INTRO;
}

function getMentorBenefits() {
  return MENTOR_BENEFITS;
}

module.exports = { MENTOR_INTRO, MENTOR_BENEFITS, getMentorIntro, getMentorBenefits };
