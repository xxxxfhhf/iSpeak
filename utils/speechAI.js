async function invoke(data){
 try{const res=await wx.cloud.callFunction({name:'Deepseek',data,config:{timeout:60000}});if(!res.result||!res.result.ok)throw new Error((res.result&&res.result.error)||'AI 服务暂不可用');return res.result;}
 catch(e){const code=e.errCode||e.code;const message=e.message||e.errMsg||'AI 请求失败';const error=new Error(/404012/.test(String(code)+message)?'云函数调用等待失败，已保留输入；正在生成的内容不会丢弃':message);error.code=code;throw error;}
}
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function progressive(data,onText,isCancelled){
 const requestId='coach_'+Date.now()+'_'+Math.random().toString(36).slice(2,10);
 let finalResult,finalError,last='';
 // Dispatch once. Poll the same request when the SDK loses its long response.
 invoke({...data,requestId}).then(r=>{finalResult=r;}).catch(e=>{finalError=e;});
 const started=Date.now();let failures=0;
 while(Date.now()-started<55000){
  if(isCancelled&&isCancelled())throw new Error('页面已离开，对话处理停止显示');
  if(finalResult&&finalResult.text){if(onText)onText(finalResult.text);return finalResult;}
  if(finalError&&!/404012|等待失败|timeout|超时/i.test(finalError.message))throw finalError;
  await pause(800);
  try{const row=await invoke({action:'peek',requestId});failures=0;if(row.text&&row.text!==last){last=row.text;if(onText)onText(last);}if(row.done){if(row.error)throw new Error(row.error);if(!row.text)throw new Error('AI 未返回正文');return {ok:true,text:row.text,sources:row.sources||[]};}}
  catch(e){if(++failures>=3||!/timeout|404012|等待失败|network|网络/i.test(e.message))throw e;}
 }
 throw new Error('本轮等待超时，已保留输入和已生成内容。请稍后重试');
}
module.exports=invoke;module.exports.progressive=progressive;
