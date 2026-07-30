/**
 * 主持稿 / 角色串词填空模板
 * 每个角色含：亮相串词 + 结束报告（总主持/即兴主持为完整环节稿）
 */
const GENERAL_HOST_TEMPLATE = {
  id: 'general_host',
  title: '总主持',
  fields: [
    { key: 'hostName', label: '总主持姓名', placeholder: '例：郭洋坚' },
    { key: 'theme', label: '会议主题', placeholder: '例：不做等春的花，要做自己的光' },
    { key: 'themeShare', label: '主题分享（1分钟）', placeholder: '我为什么选择这个主题…' },
    { key: 'meetingNo', label: '第几次会议', placeholder: '677' },
    { key: 'timerName', label: '时间官', placeholder: '' },
    { key: 'humorName', label: '幽默官', placeholder: '' },
    { key: 'fillerName', label: '赘字官', placeholder: '' },
    { key: 'photoName', label: '拍照官', placeholder: '' },
    { key: 'geName', label: '总点评', placeholder: '' },
    { key: 'closingWords', label: '闭会结语', placeholder: '感谢各位讲者与观众…' }
  ],
  sections: [
    {
      title: '亮相串词 · 开场',
      template: '各位来宾、会员，大家晚上好！我是今天的总主持{{hostName}}。欢迎参加厦门演讲俱乐部第{{meetingNo}}次会议。\n\n今天的会议主题是「{{theme}}」。{{themeShare}}\n\n接下来，让我们进入角色亮相环节，首先有请时间官 {{timerName}} 为大家介绍时间规则。'
    },
    {
      title: '亮相串词 · 角色介绍',
      template: '感谢时间官。下面有请幽默官 {{humorName}}、赘字官 {{fillerName}}、拍照官 {{photoName}}、总点评 {{geName}} 依次亮相并介绍职责。'
    },
    {
      title: '亮相串词 · 备稿串场',
      template: '感谢各位角色官。接下来进入备稿演讲环节。请听众认真聆听，待会儿为你心目中的最佳演讲投上一票。\n\n（介绍每位备稿演讲者时使用：）下面有请备稿演讲者，演讲题目是《____》，路径项目____，让我们用热烈的掌声欢迎____！\n\n（演讲结束后：）感谢____的精彩分享，请回到座位。我们静默1分钟，请大家思考刚才的演讲。'
    },
    {
      title: '结束报告 · 闭会',
      template: '{{closingWords}}\n\n感谢今晚所有参与者，现在我宣布厦门演讲俱乐部第{{meetingNo}}次会议到此结束。祝大家晚安！'
    }
  ]
};

const TABLE_TOPICS_TEMPLATE = {
  id: 'table_topics',
  title: '即兴主持',
  fields: [
    { key: 'hostName', label: '即兴主持姓名', placeholder: '' },
    { key: 'theme', label: '即兴主题', placeholder: '例：春天' },
    { key: 'rules', label: '发言规则', placeholder: '每人1-2分钟，自愿上台' },
    { key: 'opening', label: '开场互动', placeholder: '请随我念：你快乐吗？我很…' },
    { key: 'closingNote', label: '结束致谢', placeholder: '感谢所有勇敢上台的朋友' }
  ],
  sections: [
    {
      title: '亮相串词 · 开场',
      template: '大家好，我是即兴演讲主持 {{hostName}}。即兴演讲是锻炼表达力的绝佳机会——题目公布后即可上台，无需准备。\n\n{{opening}}\n\n今天的即兴主题是「{{theme}}」。规则如下：{{rules}}\n\n请自告奋勇的朋友举手示意，我将邀请你上台。'
    },
    {
      title: '亮相串词 · 邀请上台',
      template: '好的，我看到有位朋友已经举手了。请____来到台前。你的题目是：____。\n请稍事准备，计时从你说「大家好」开始。'
    },
    {
      title: '结束报告',
      template: '{{closingNote}}。即兴环节到此结束，请将主持棒交还总主持。'
    }
  ]
};

/** 会议角色：亮相 + 结束报告 */
const TIMER_ROLE_TEMPLATE = {
  id: 'timer',
  title: '时间官',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'greenRule', label: '绿牌规则', placeholder: '例：剩余1分钟举绿牌' },
    { key: 'yellowRule', label: '黄牌规则', placeholder: '例：剩余30秒举黄牌' },
    { key: 'redRule', label: '红牌规则', placeholder: '例：时间到举红牌并响铃' },
    { key: 'reportNote', label: '报告备注', placeholder: '超时/欠时情况简述' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是今天的时间官{{name}}。我将为各位讲者计时并举牌提示。\n规则：{{greenRule}}；{{yellowRule}}；{{redRule}}。\n请讲者注意牌色，合理分配时间。谢谢！'
    },
    {
      title: '结束报告',
      template: '各位好，我是时间官{{name}}，下面汇报本场计时情况。\n{{reportNote}}\n以上是时间报告，谢谢大家！'
    }
  ]
};

const HUMOR_ROLE_TEMPLATE = {
  id: 'humor',
  title: '幽默官',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'dutyTip', label: '职责补充', placeholder: '记录幽默亮点，会后报告' },
    { key: 'highlights', label: '幽默亮点', placeholder: '例：某某用____引发全场笑声' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是今天的幽默官{{name}}。{{dutyTip}}\n请各位讲者大胆展现幽默，我会认真记录今晚的笑点。谢谢！'
    },
    {
      title: '结束报告',
      template: '各位好，我是幽默官{{name}}。今晚的幽默亮点有：\n{{highlights}}\n幽默让演讲更有温度，感谢各位的精彩表现！'
    }
  ]
};

const FILLER_ROLE_TEMPLATE = {
  id: 'filler',
  title: '赘字官',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'focusWords', label: '关注赘字', placeholder: '例：嗯、那个、然后、就是' },
    { key: 'reportDetail', label: '报告内容', placeholder: '例：某某「然后」出现较多次' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是今天的赘字官{{name}}。我将留意口头禅与赘字，重点关注：{{focusWords}}。\n目的不是挑刺，而是帮助大家表达更干净有力。谢谢！'
    },
    {
      title: '结束报告',
      template: '各位好，我是赘字官{{name}}。本场赘字观察：\n{{reportDetail}}\n建议大家下次刻意减少口头禅，让观点更清晰。谢谢！'
    }
  ]
};

const PHOTO_ROLE_TEMPLATE = {
  id: 'photo',
  title: '拍照官',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'plan', label: '拍摄计划', placeholder: '例：讲者特写、合影、互动瞬间' },
    { key: 'closingTip', label: '结束提醒', placeholder: '例：会后请到前排合影' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是今天的拍照官{{name}}。今晚我会记录：{{plan}}。\n请讲者自然表达，我会尽量不打扰现场节奏。谢谢！'
    },
    {
      title: '结束报告',
      template: '各位好，我是拍照官{{name}}。今晚影像已基本记录完成。{{closingTip}}\n照片稍后会分享到群里，谢谢大家配合！'
    }
  ]
};

const GE_ROLE_TEMPLATE = {
  id: 'ge',
  title: '总点评',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'focus', label: '点评关注点', placeholder: '例：结构、台风、互动、时间控制' },
    { key: 'summary', label: '总评摘要', placeholder: '本场亮点与改进建议' },
    { key: 'awards', label: '投票结果', placeholder: '最佳演讲/角色/点评…' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是今天的总点评{{name}}。我将从整体视角观察本场会议，关注：{{focus}}。\n请各位讲者尽情发挥，我会后给出建设性反馈。谢谢！'
    },
    {
      title: '结束报告',
      template: '各位好，我是总点评{{name}}。\n本场总评：{{summary}}\n投票结果：{{awards}}\n感谢所有参与者，让我们下周再见！'
    }
  ]
};

const PREP_EVAL_TEMPLATE = {
  id: 'prep_eval',
  title: '备稿点评',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'speaker', label: '点评对象', placeholder: '演讲者姓名' },
    { key: 'praise', label: '优点', placeholder: '结构清晰 / 故事感人…' },
    { key: 'improve', label: '建议', placeholder: '可加强开场钩子…' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是备稿点评官{{name}}。我将从结构、内容、台风等维度为备稿演讲者提供反馈，帮助对方下一次更好。谢谢！'
    },
    {
      title: '结束报告',
      template: '感谢{{speaker}}的分享。\n优点：{{praise}}\n建议：{{improve}}\n以上是备稿点评，谢谢！'
    }
  ]
};

const TT_EVAL_TEMPLATE = {
  id: 'tt_eval',
  title: '即兴点评',
  fields: [
    { key: 'name', label: '姓名', placeholder: '' },
    { key: 'speakers', label: '点评对象', placeholder: '可写多位讲者' },
    { key: 'praise', label: '优点', placeholder: '反应快 / 观点鲜明…' },
    { key: 'improve', label: '建议', placeholder: '可先亮观点再举例…' }
  ],
  sections: [
    {
      title: '亮相串词',
      template: '大家好，我是即兴点评官{{name}}。即兴重在敢说与结构，我会关注观点是否清晰、例子是否有力。请大家放心上台！'
    },
    {
      title: '结束报告',
      template: '即兴点评报告——对象：{{speakers}}\n优点：{{praise}}\n建议：{{improve}}\n感谢所有即兴讲者的勇气！'
    }
  ]
};

/** 角色列表（供页面选择） */
const ROLE_SCRIPT_LIST = [
  { id: 'general_host', title: '总主持' },
  { id: 'table_topics', title: '即兴主持' },
  { id: 'timer', title: '时间官' },
  { id: 'humor', title: '幽默官' },
  { id: 'filler', title: '赘字官' },
  { id: 'photo', title: '拍照官' },
  { id: 'ge', title: '总点评' },
  { id: 'prep_eval', title: '备稿点评' },
  { id: 'tt_eval', title: '即兴点评' }
];

const ROLE_SCRIPT_MAP = {
  general_host: GENERAL_HOST_TEMPLATE,
  table_topics: TABLE_TOPICS_TEMPLATE,
  timer: TIMER_ROLE_TEMPLATE,
  humor: HUMOR_ROLE_TEMPLATE,
  filler: FILLER_ROLE_TEMPLATE,
  photo: PHOTO_ROLE_TEMPLATE,
  ge: GE_ROLE_TEMPLATE,
  prep_eval: PREP_EVAL_TEMPLATE,
  tt_eval: TT_EVAL_TEMPLATE
};

function getRoleScriptTemplate(roleId) {
  return ROLE_SCRIPT_MAP[roleId] || GENERAL_HOST_TEMPLATE;
}

function fillTemplate(text, values) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || '____');
}

function generateScript(template, values) {
  return template.sections.map(sec => ({
    title: sec.title,
    content: fillTemplate(sec.template, values)
  }));
}

module.exports = {
  GENERAL_HOST_TEMPLATE,
  TABLE_TOPICS_TEMPLATE,
  ROLE_SCRIPT_LIST,
  ROLE_SCRIPT_MAP,
  getRoleScriptTemplate,
  fillTemplate,
  generateScript
};
