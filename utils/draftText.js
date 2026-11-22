module.exports=function draftText(raw){
 if(typeof raw!=='string'||!raw.trim())throw new Error('AI 未返回正文');
 let text=raw.trim().replace(/^```(?:json|markdown)?\s*/i,'').replace(/\s*```$/,'');
 if(text.charAt(0)==='{'){try{const json=JSON.parse(text);if(Array.isArray(json.cards)&&json.cards.some(c=>c&&typeof c.content==='string'&&c.content.trim()))return {title:String(json.title||'我的演讲稿'),cards:json.cards.filter(c=>c&&typeof c.content==='string'&&c.content.trim()).map(c=>({type:c.type||'background',title:c.title||'正文',content:c.content}))};}catch(e){}}
 const lines=text.split(/\r?\n/);let title='我的演讲稿';if(/^#\s+/.test(lines[0])){title=lines.shift().replace(/^#\s+/,'').trim();}
 const cards=[];let heading='正文',body=[];function flush(){const content=body.join('\n').trim();if(content)cards.push({type:cards.length?'background':'opening',title:heading,content});body=[];}
 for(const line of lines){if(/^#{2,3}\s+/.test(line)){flush();heading=line.replace(/^#{2,3}\s+/,'').trim();}else body.push(line);}flush();
 if(!cards.length)throw new Error('AI 未返回正文');return {title,cards};
};
