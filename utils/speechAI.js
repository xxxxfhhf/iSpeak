module.exports = async function speechAI(data) {
 const res = await wx.cloud.callFunction({ name: 'speechAI', data, config: { timeout: 90000 } });
 if (!res.result || !res.result.ok) throw new Error((res.result && res.result.error) || 'AI 服务尚未部署或暂不可用');
 return res.result;
};
