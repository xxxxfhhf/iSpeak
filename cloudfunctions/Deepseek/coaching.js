const TYPES={auto:'自动识别',general:'通用表达',story:'故事演讲',report:'工作汇报',persuasive:'观点说服',impromptu:'即兴表达'};
const LEVELS={
 G1:'第一阶：先帮助用户敢说、说清一件事。用日常语言和具体画面，不要求复杂术语；把目标拆成很小的一步。',
 G2:'第二阶：关注结构、证据、细节、情绪转折和听众收益；让用户比较表达选择，聚焦一个值得打磨的问题。',
 G3:'第三阶：关注立意、叙事张力、论证边界和听众行动；适度挑战假设，追问证据或取舍，尊重用户已有方法。'
};
function normalize(value){
 const c=value&&typeof value==='object'?value:{};
 return {mode:c.mode==='general'?'general':'level',level:LEVELS[c.level]?c.level:'G1',speechType:TYPES[c.speechType]?c.speechType:'auto'};
}
function guidance(value){
 const c=normalize(value);
 return '\n【互动设置】'+(c.mode==='general'?'通用模式：不按会员等级预设能力，依据当下回答调整难度。':LEVELS[c.level]+' 该等级是个人学习设置，不是正式认证。')+
 '\n【交流方式】温柔而坚定：先具体回应已听到的内容，再指出当前唯一需要推进的缺口，最后只问一个容易回答的问题。简短回应，通常80至180字；不要说教或机械表扬。用户卡住时给两个小方向，让他选一个；允许跳过隐私与暂时不愿讲的内容，不逼迫披露创伤。不要反复问已经回答的信息。'+
 '\n【演讲类型】'+(c.speechType==='auto'?'根据用户内容推断类型。信息不足用general，不武断贴标签；类型明显后直接采用对应方式，无需额外发起分类请求。':'用户明确选择'+TYPES[c.speechType]+'，不得擅自切换；用户想切换时提醒可更改设置。')+
 '\n【故事演讲】围绕一个真实事件逐步补齐：想传递的感悟、人物与场景、期待、阻碍、关键选择、转折、结果和回望。不要一口气问完；跟随叙述找缺口，帮助讲完故事，不替用户编造细节。故事完整后先总结主线，邀请确认是否整理成稿。'+
 '\n【工作汇报】先厘清汇报对象及希望对方作出的决定，再梳理目标、已完成结果与证据、差距、原因、卡点、所需支持及下一步。区分事实、推测和计划；没有数据不编数据，先用待补充标记。卡住时先帮用户区分不知道怎么说与工作本身未想清。'+
 '\n【观点说服】明确主张、听众顾虑、证据、反方解释与行动请求；一次处理一个论证缺口。'+
 '\n【即兴表达】先提炼一句观点，再组织一个理由或例子并回扣主题，避免复杂长流程。'+
 '\n【通用表达】先问清想表达什么及给谁听，再按需要组织思路；不强套故事框架。'+
 '\n【材料依据】路径原文或案例只在检索到时引用，不捏造课程内容；用户原话与会员案例必须区分。';
}
function parseCoach(raw,context){
 const c=normalize(context);
 if(typeof raw!=='string'||!raw.trim())throw new Error('教练未返回正文，请重试');
 let text=raw.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
 // Accept legacy structured responses, but ordinary dialogue is plain text.
 if(text.charAt(0)==='{'){
  let data;try{data=JSON.parse(text);}catch(e){throw new Error('回复被截断，请重试；你的输入已保留');}
  text=data.reply||data.text||data.content;
  if(typeof text!=='string'||!text.trim())throw new Error('教练未返回正文，请重试');
 }
 return {text, ...(c.speechType==='auto'?{}:{detectedType:c.speechType})};
}
module.exports={normalize,guidance,parseCoach};
