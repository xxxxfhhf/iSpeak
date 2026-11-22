const DEFINITIONS={
 story:[['scene','人物与场景','谁、何时、在哪里',/当时|那年|那天|去年|今年|小时候|同事|家人|朋友|公司|学校|家里/],['goal','原本的期待','你想实现什么',/希望|想要|打算|目标|期待|准备|想让/],['conflict','困难与冲突','什么阻碍了你',/但是|不过|却|困难|失败|拒绝|冲突|害怕|生气|卡住|担心/],['action','关键行动','你具体做了什么',/决定|选择|尝试|沟通|解释|道歉|坚持|改变|我就|于是|我先/],['result','事情结果','事情如何结束',/最后|最终|结果|后来|成功|完成|解决|和好|结束/],['meaning','感悟与主线','希望听众带走什么',/学会|明白|意识到|懂得|感悟|让我|启发|道理|记住/]],
 report:[['audience','汇报对象','向谁汇报',/领导|老板|主管|经理|团队|客户|同事|汇报给/],['goal','目标','本次汇报要解决什么',/目标|计划|任务|希望|需要决定|目的/],['results','结果与证据','已经完成了什么',/完成|达成|增长|下降|数据|百分之|%|交付|指标|收入/],['blocker','差距与卡点','哪里还未达到预期',/问题|卡住|困难|落后|风险|延期|差距|原因|不足/],['next','下一步行动','接下来怎么做',/接下来|下一步|下周|计划|准备|调整|采取/],['support','需要的支持','需要什么决定或资源',/支持|资源|预算|人手|协调|审批|批准|决策/]],
 general:[['topic','表达主题','想讲什么',/主题|想讲|想说|关于|这次|分享/],['audience','听众与目标','说给谁听，想达到什么',/听众|观众|同事|朋友|领导|客户|希望|目标/],['point','核心观点','最重要的一句话',/认为|觉得|观点|关键|重要|主张/],['example','事实与例子','用什么支撑观点',/比如|例如|有一次|经历|数据|当时|那天/],['ending','结尾与行动','希望听众记住或去做什么',/最后|总结|记住|行动|希望大家|下一步|建议/]]};
function infer(messages,type){if(type&&type!=='auto')return type==='report'?'report':type==='story'?'story':'general';const text=messages.filter(m=>m.role==='user').map(m=>m.content).join('');return /工作汇报|周报|项目进展|向领导汇报/.test(text)?'report':/故事|有一次|那年|小时候|当时/.test(text)?'story':'general';}
function derive(messages,type,overrides={}){
 const kind=infer(messages,type);const fields=DEFINITIONS[kind];
 const items=fields.map(([id,label,hint,pattern])=>{
  let evidence='';for(let i=0;i<messages.length;i++){const m=messages[i];if(m.role!=='user'||typeof m.content!=='string'||m.content.trim().length<8||/^(不知道|还没想好|不想说|跳过)[。！!？?\s]*$/.test(m.content.trim()))continue;
   const previous=i?messages[i-1]:null;if(pattern.test(m.content)||(previous&&previous.role==='assistant'&&pattern.test(previous.content))){evidence=m.content.trim().slice(0,50);break;}}
  const manual=typeof overrides[id]==='boolean';return {id,label,hint,evidence,done:manual?overrides[id]:!!evidence,manual};
 });const done=items.filter(i=>i.done).length,missing=items.filter(i=>!i.done);return {kind,items,done,total:items.length,percent:Math.round(done/items.length*100),remaining:missing.length,next:missing[0]?missing[0].label:'可以先整理成稿，再按需要打磨'};
}
function summary(messages,type){const p=derive(messages,type);return '素材覆盖度仅为估计：已记录'+p.items.filter(i=>i.done).map(i=>i.label).join('、')+'；尚待补充'+p.items.filter(i=>!i.done).map(i=>i.label).join('、')+'。不要重复追问已有信息。缺项只选一个最关键问题；用户说先成稿就停止追问，缺少事实标待补充，不编造。素材已覆盖时直接邀请成稿，不要无休止追问。';}
module.exports={derive,summary};
