module.exports = async function speechAI(data) {
 const res = await wx.cloud.callFunction({ name: 'Deepseek', data, config: { timeout: 90000 } });
 if (!res.result || !res.result.ok) throw new Error((res.result && res.result.error) || 'AI 服务尚未部署或暂不可用');
 const result=res.result;
 if(data.action==='coach'&&typeof result.text==='string'){
  const raw=result.text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  if(raw.charAt(0)==='{'){try{const parsed=JSON.parse(raw);if(parsed.reply){result.text=parsed.reply;result.detectedType=parsed.detectedType;}}catch(e){throw new Error('AI 回复格式异常，请重试');}}
 }
 return result;
};
