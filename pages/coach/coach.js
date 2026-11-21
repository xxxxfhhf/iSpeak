const call=require('../../utils/speechAI');
const Storage=require('../../utils/storage');
const KEY='speech_coach_session';
Page({
 data:{messages:[],input:'',busy:false,recording:false,starting:false,ready:false,sources:[],projectId:'',scrollTo:''},
 onLoad(){
  const saved=wx.getStorageSync(KEY)||{};this.setData({messages:saved.messages||[],projectId:saved.projectId||''});
  this.recorder=wx.getRecorderManager();
  this.recorder.onStart(()=>{if(this.closed){this.recorder.stop();return;}this.setData({recording:true,starting:false});});
  this.recorder.onError(()=>{if(!this.closed){this.setData({recording:false,starting:false});wx.showToast({title:'无法录音，请检查麦克风权限',icon:'none'});}});
  this.recorder.onStop(async res=>{
   if(this.closed)return;this.setData({recording:false,starting:false,busy:true});
   try{
    const audio=wx.getFileSystemManager().readFileSync(res.tempFilePath,'base64');
    const result=await call({action:'transcribe',audio});
    if(!this.closed)this.setData({input:[this.data.input,result.text].filter(Boolean).join(' ')});
   }catch(e){this.error(e);}finally{if(!this.closed)this.setData({busy:false});}
  });
 },
 onUnload(){this.closed=true;if(this.recorder&&(this.data.recording||this.data.starting))this.recorder.stop();},
 onHide(){if(this.recorder&&this.data.recording)this.recorder.stop();},
 error(e){if(!this.closed)wx.showModal({title:'暂未完成',content:e.message||'请求失败，请重试',showCancel:false});},
 persist(){wx.setStorageSync(KEY,{messages:this.data.messages,projectId:this.data.projectId});},
 onInput(e){this.setData({input:e.detail.value});},
 onRecord(){
  if(this.data.busy||this.data.starting)return;
  if(this.data.recording){this.recorder.stop();return;}
  wx.showModal({title:'语音输入',content:'录音将发送给 DeepSeek 转成文字。每段最多60秒，识别后可先确认再发送。',success:r=>{if(r.confirm&&!this.closed){const start=()=>{this.setData({starting:true});this.recorder.start({duration:60000,sampleRate:16000,numberOfChannels:1,format:'PCM'});};if(wx.requirePrivacyAuthorize){wx.requirePrivacyAuthorize({success:start,fail:()=>wx.showToast({title:'请先同意隐私授权后使用录音',icon:'none'})});}else{start();}}}});
 },
 async send(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.input.trim())return;
  if(this.data.messages.length>=22){wx.showToast({title:'请先整理成稿或开始新对话',icon:'none'});return;}
  const messages=[...this.data.messages,{role:'user',content:this.data.input.trim()}];
  this.setData({busy:true,input:''});
  try{const result=await call({action:'coach',messages});if(this.closed)return;
   this.setData({messages:[...messages,{role:'assistant',content:result.text}],sources:result.sources||[],scrollTo:'msg-'+messages.length});this.persist();
  }catch(e){if(!this.closed)this.setData({input:messages[messages.length-1].content});this.error(e);}finally{if(!this.closed)this.setData({busy:false});}
 },
 async draft(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.messages.length)return;
  this.setData({busy:true});
  try{
   const result=await call({action:'draft',messages:this.data.messages});const draft=JSON.parse(result.text);
   if(!draft.title||!Array.isArray(draft.cards)||!draft.cards.length||draft.cards.some(c=>typeof c.content!=='string'))throw new Error('稿件格式异常，原对话已保留，请重试');
   if(this.closed)return;
   const existing=this.data.projectId&&Storage.getProject(this.data.projectId);
   let id=this.data.projectId;
   if(existing){Storage.saveProjectData(id,{draftHistory:[...(existing.draftHistory||[]),{cards:existing.cards,createdAt:Date.now()}].slice(-5)});}else{id=Storage.createProject(draft.title);}
   Storage.saveProjectMeta({id,title:String(draft.title)});
   Storage.saveProjectData(id,{cards:draft.cards.slice(0,20).map((c,i)=>({id:id+'_'+i,type:c.type||'background',title:c.title||'段落',content:c.content,durationSec:Math.ceil(c.content.length/2.5),quotes:[]})),coachMessages:this.data.messages,knowledgeSources:result.sources||[]});
   this.setData({projectId:id});this.persist();wx.navigateTo({url:'/pages/index/index?id='+id});
  }catch(e){this.error(e);}finally{if(!this.closed)this.setData({busy:false});}
 },
 fresh(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showModal({title:'开始新对话',content:'当前对话将清空；已生成的稿件仍保留在首页。',success:r=>{if(r.confirm){this.setData({messages:[],input:'',projectId:'',sources:[]});this.persist();}}});}
});
