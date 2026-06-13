/**
 * 导师认证介绍与权益 — 对齐 L3 手册导师认证说明
 */

const MENTOR_INTRO = {
  intro: '完成 L3 全部必修路径并通过导师认证后，你将从「学习者」转变为「带教者」，在俱乐部中承担更多角色，帮助新会员成长。\n\n导师是俱乐部互助文化的核心：你曾走过的路，将成为新会员的灯塔。',
  duties: '【导师主要职责】\n· 担任新会员的导师，跟进其路径学习进度\n· 在备稿演讲、路径演练中给予点评与反馈\n· 选修 L3X1：任选演讲知识，线下开展认证工作坊（综合评分≥80）\n· 参与俱乐部教育事务，传承演讲经验'
};

/** 导师权益对照表：会员 vs 导师 */
const MENTOR_BENEFITS = [
  { item: '演讲晋级手册', member: '√', mentor: '√' },
  { item: '导师带队（带教新会员）', member: '×', mentor: '√' },
  { item: '认证工作坊主讲', member: '×', mentor: '√' },
  { item: '导师证书与身份认定', member: '×', mentor: '√' },
  { item: '备稿/路径深度点评', member: '学习', mentor: '带领' },
  { item: '俱乐部教育事务参与', member: '有限', mentor: '深度参与' },
  { item: '会议角色优先安排', member: '申请', mentor: '优先' },
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
