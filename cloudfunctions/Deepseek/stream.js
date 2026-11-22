const https=require('https');
const {StringDecoder}=require('string_decoder');
module.exports=function stream(body,onText){
 return new Promise((resolve,reject)=>{
  let settled=false,text='',buffer='',writes=Promise.resolve(),lastWrite=0,gotDone=false;
  const decoder=new StringDecoder('utf8');
  const finish=(err)=>{if(settled)return;settled=true;clearTimeout(deadline);writes.then(()=>err?reject(err):text?resolve(text):reject(new Error('AI 未返回正文'))).catch(reject);};
  const line=value=>{if(!value.startsWith('data:'))return;const payload=value.slice(5).trim();if(!payload)return;if(payload==='[DONE]'){gotDone=true;return;}let data;try{data=JSON.parse(payload);}catch(e){throw new Error('AI 流数据不完整，请重试');}if(data.error)throw new Error('AI 服务返回错误，请重试');const choice=data.choices&&data.choices[0];const delta=choice&&choice.delta&&choice.delta.content;if(delta){text+=delta;if(text.length>12000)throw new Error('回复过长');if(Date.now()-lastWrite>600){const snapshot=text;lastWrite=Date.now();writes=writes.then(()=>onText(snapshot));writes.catch(()=>{});}}};
  const req=https.request({hostname:'api.deepseek.com',path:'/chat/completions',method:'POST',headers:{Authorization:'Bearer '+process.env.DEEPSEEK_API_KEY,'Content-Type':'application/json'}},res=>{
   if(res.statusCode!==200){res.resume();finish(new Error(res.statusCode===402?'DeepSeek 余额不足':res.statusCode===401?'DeepSeek 密钥无效':res.statusCode===429?'AI 服务繁忙，请稍后重试':'AI 服务请求失败（'+res.statusCode+'）'));return;}
   res.on('data',chunk=>{if(settled)return;try{buffer+=decoder.write(chunk);let i;while((i=buffer.indexOf('\n'))>=0){const current=buffer.slice(0,i).trim();buffer=buffer.slice(i+1);line(current);}}catch(e){finish(e);req.destroy();}});
   res.on('end',()=>{if(settled)return;try{buffer+=decoder.end();if(buffer.trim())line(buffer.trim());finish(gotDone?null:new Error('AI 连接中断，已生成内容保留'));}catch(e){finish(e);}});res.on('error',finish);
  });
  const deadline=setTimeout(()=>{finish(new Error('AI 响应超过40秒，已生成内容保留'));req.destroy();},40000);
  req.on('error',finish);req.end(JSON.stringify({...body,stream:true}));
 });
};
