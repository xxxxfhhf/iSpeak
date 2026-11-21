const call=require('../../utils/speechAI');
const Storage=require('../../utils/storage');
const KEY='speech_coach_session';
const TYPES=[{id:'auto',name:'自动识别'},{id:'general',name:'通用表达'},{id:'story',name:'故事演讲'},{id:'report',name:'工作汇报'},{id:'persuasive',name:'观点说服'},{id:'impromptu',name:'即兴表达'}];
Page({
 data:{mode:'level',speechType:'auto',modeLabel:'按我的等级',typeLabel:'自动识别',detectedLabel:'',messages:[],input:'',busy:false,recording:false,starting:false,ready:false,showDetails:false,phase:'idle',greeting:'你好，我是你的演讲教练。今天，有什么想说的？',sources:[],projectId:'',scrollTo:''},
 onLoad(){
  const saved=wx.getStorageSync(KEY)||{};this.setData({messages:saved.messages||[],projectId:saved.projectId||'',greeting:(saved.messages||[]).length?'欢迎回来，我们继续聊你的故事。':'你好，我是你的演讲教练。今天，有什么想说的？'});
  const prefs=wx.getStorageSync('coach_preferences')||{};this.setData({mode:prefs.mode==='general'?'general':'level',speechType:TYPES.some(t=>t.id===prefs.speechType)?prefs.speechType:'auto'});this.refreshSettings();
  this.recorder=wx.getRecorderManager();
  this.recorder.onStart(()=>{if(this.closed){this.recorder.stop();return;}this.setData({recording:true,starting:false,phase:'listening'});});
  this.recorder.onError(()=>{if(!this.closed){this.setData({recording:false,starting:false,phase: "idle"});wx.showToast({title:'无法录音，请检查麦克风权限',icon:'none'});}});
  this.recorder.onStop(async res=>{
   if(this.closed)return;this.setData({recording:false,starting:false,busy:true,phase:'recognizing'});
   try{
    const audio=wx.getFileSystemManager().readFileSync(res.tempFilePath,'base64');
    const result=await call({action:'transcribe',audio});
    if(!this.closed){this.setData({input:[this.data.input,result.text].filter(Boolean).join(' '),busy:false});if(this.data.input.trim())await this.send();else wx.showToast({title:'没听清，请再说一次',icon:'none'});}
   }catch(e){this.error(e);}finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
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
  const begin=()=>{if(this.closed)return;const start=()=>{if(this.closed)return;this.setData({starting:true});this.recorder.start({duration:60000,sampleRate:16000,numberOfChannels:1,format:'PCM'});};if(wx.requirePrivacyAuthorize)wx.requirePrivacyAuthorize({success:start,fail:()=>wx.showToast({title:'请先同意隐私授权',icon:'none'})});else start();};
  if(wx.getStorageSync('voice_coach_consent_v1'))begin();else wx.showModal({title:'开启语音对话',content:'录音将发送至 DeepSeek 识别，结束后自动发送给教练。每段最多60秒，识别文字可在对话记录中查看。',success:r=>{if(r.confirm){wx.setStorageSync('voice_coach_consent_v1',true);begin();}}});
 },
 refreshSettings(){
  const profile=wx.getStorageSync('user_member_profile')||{};const level=['G1','G2','G3'].includes(profile.level)?profile.level:'G1';
  this.setData({modeLabel:this.data.mode==='general'?'通用模式':level+' 等级引导',typeLabel:TYPES.find(t=>t.id===this.data.speechType).name});
 },
 context(){const profile=wx.getStorageSync('user_member_profile')||{};return {mode:this.data.mode,level:['G1','G2','G3'].includes(profile.level)?profile.level:'G1',speechType:this.data.speechType};},
 chooseMode(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:['按我的学习等级引导','通用模式（不限定等级）'],success:r=>{this.setData({mode:r.tapIndex===1?'general':'level'});this.saveSettings();}});},
 chooseType(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:TYPES.map(t=>t.name),success:r=>{this.setData({speechType:TYPES[r.tapIndex].id,detectedLabel:''});this.saveSettings();}});},
 saveSettings(){wx.setStorageSync('coach_preferences',{mode:this.data.mode,speechType:this.data.speechType});this.refreshSettings();},
 toggleDetails(){this.setData({showDetails:!this.data.showDetails});},
 more(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:['查看对话 / 文字补充','整理成稿','开始新对话'],success:r=>{if(r.tapIndex===0)this.toggleDetails();if(r.tapIndex===1)this.draft();if(r.tapIndex===2)this.fresh();}});},
 async send(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.input.trim())return;
  if(this.data.messages.length>=22){wx.showToast({title:'请先整理成稿或开始新对话',icon:'none'});return;}
  const messages=[...this.data.messages,{role:'user',content:this.data.input.trim()}];
  this.setData({busy:true,input:'',phase:'thinking'});
  try{const result=await call({action:'coach',messages,coaching:this.context()});if(this.closed)return;
   this.setData({messages:[...messages,{role:'assistant',content:result.text}],detectedLabel:(TYPES.find(t=>t.id===result.detectedType)||{}).name||'',sources:result.sources||[],scrollTo:'msg-'+messages.length});this.persist();
  }catch(e){if(!this.closed)this.setData({input:messages[messages.length-1].content});this.error(e);}finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
 },
 async draft(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.messages.length)return;
  this.setData({busy:true,phase:'drafting'});
  try{
   const result=await call({action:'draft',messages:this.data.messages,coaching:this.context()});const draft=JSON.parse(result.text);
   if(!draft.title||!Array.isArray(draft.cards)||!draft.cards.length||draft.cards.some(c=>typeof c.content!=='string'))throw new Error('稿件格式异常，原对话已保留，请重试');
   if(this.closed)return;
   const existing=this.data.projectId&&Storage.getProject(this.data.projectId);
   let id=this.data.projectId;
   if(existing){Storage.saveProjectData(id,{draftHistory:[...(existing.draftHistory||[]),{cards:existing.cards,createdAt:Date.now()}].slice(-5)});}else{id=Storage.createProject(draft.title);}
   Storage.saveProjectMeta({id,title:String(draft.title)});
   Storage.saveProjectData(id,{cards:draft.cards.slice(0,20).map((c,i)=>({id:id+'_'+i,type:c.type||'background',title:c.title||'段落',content:c.content,durationSec:Math.ceil(c.content.length/2.5),quotes:[]})),coachMessages:this.data.messages,coaching:this.context(),knowledgeSources:result.sources||[]});
   this.setData({projectId:id});this.persist();wx.navigateTo({url:'/pages/index/index?id='+id});
  }catch(e){this.error(e);}finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
 },
 fresh(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showModal({title:'开始新对话',content:'当前对话将清空；已生成的稿件仍保留在首页。',success:r=>{if(r.confirm){this.setData({greeting:'你好，这次有什么想表达的？',detectedLabel:'',messages:[],input:'',projectId:'',sources:[]});this.persist();}}});}
});
