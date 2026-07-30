/**
 * 俱乐部官员配置 — 职责说明 + 本届名单（可定期更新）
 */
const OFFICER_DUTIES = [
  { id: 'president', title: '主席', duty: '负责接待签到、开幕致辞、俱乐部介绍，统筹会议整体氛围。' },
  { id: 'vpe', title: '教育副主席', duty: '负责会员教育路径、备稿与即兴安排、工作坊规划。' },
  { id: 'vpm', title: '会员副主席', duty: '负责会员发展、来宾接待与入会引导。' },
  { id: 'vppr', title: '公关副主席', duty: '负责宣传、来宾邀请、会议摄影与品牌传播。' },
  { id: 'sec', title: '秘书长', duty: '负责会议记录、议程协调、官员沟通。' },
  { id: 'treasurer', title: '财务官', duty: '负责俱乐部财务管理（如有）。' },
  { id: 'saa', title: '接待官', duty: '负责会场布置、签到、引导来宾就座。' }
];

/** 2026 上半年示例名单（来自 677 议程，可替换） */
const DEFAULT_OFFICERS = [
  { title: '主席', name: '翠荣', phone: '15980937353' },
  { title: '副主席', name: '福受', phone: '19165608147' },
  { title: '教育副主席', name: '许梅琴', phone: '13960704039' },
  { title: '教育副主席助理', name: '韩韩', phone: '15985828983' },
  { title: '会员副主席', name: '郭洋坚', phone: '13959241483' },
  { title: '公关副主席', name: '珂珂', phone: '13959230621' },
  { title: '秘书长', name: '曹燕辉', phone: '18659205001' },
  { title: '接待官', name: '从权', phone: '15805918260' },
  { title: '活动官', name: '智群', phone: '15960279633' }
];

const ROLE_INTROS = [
  { role: '总主持', scriptId: 'general_host', duty: '串联全场、介绍角色与演讲者、控制节奏与氛围。' },
  { role: '即兴主持', scriptId: 'table_topics', duty: '主持即兴演讲环节，公布主题、邀请上台、控时。' },
  { role: '时间官', scriptId: 'timer', duty: '负责计时并举绿/黄/红牌，时间到响铃；环节结束提交时间报告。' },
  { role: '幽默官', scriptId: 'humor', duty: '记录演讲中的幽默亮点，环节结束提交幽默报告。' },
  { role: '赘字官', scriptId: 'filler', duty: '记录赘字/口头禅，环节结束提交赘字报告。' },
  { role: '拍照官', scriptId: 'photo', duty: '负责会议摄影、合影，会间休息引导交流。' },
  { role: '总点评', scriptId: 'ge', duty: '点评整场会议，汇总最佳演讲/角色/点评投票结果。' },
  { role: '备稿点评', scriptId: 'prep_eval', duty: '针对备稿演讲从结构、内容、台风等维度点评。' },
  { role: '即兴点评', scriptId: 'tt_eval', duty: '针对即兴演讲者逐一点评。' }
];

module.exports = {
  OFFICER_DUTIES,
  DEFAULT_OFFICERS,
  ROLE_INTROS
};
