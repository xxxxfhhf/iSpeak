const SpeechQueue=require('../../utils/speechQueue');
const Materials=require('../../utils/materialProgress');
const parseDraft=require('../../utils/draftText');
const normalizeWav=require('../../utils/wavAudio');
const Vault=require('../../utils/recordingVault');
const call=require('../../utils/speechAI');
const Storage=require('../../utils/storage');
const KEY='speech_coach_session';
const TYPES=[{id:'auto',name:'自动识别'},{id:'general',name:'通用表达'},{id:'story',name:'故事演讲'},{id:'report',name:'工作汇报'},{id:'persuasive',name:'观点说服'},{id:'impromptu',name:'即兴表达'}];
Page({
 data:{materialProgress:{percent:0,done:0,total:5,remaining:5,next:'表达主题',items:[]},showProgress:false,materialOverrides:{},mode:'level',speechType:'auto',modeLabel:'按我的等级',typeLabel:'自动识别',detectedLabel:'',partialReply:'',lastSpoken:'',messages:[],input:'',busy:false,recording:false,starting:false,ready:false,retryAvailable:false,recoveryMessage:'',speaking:false,audioStatus:'',showDetails:false,phase:'idle',greeting:'你好，我是你的演讲教练。今天，有什么想说的？',sources:[],projectId:'',scrollTo:''},
 onLoad(){
  const saved=wx.getStorageSync(KEY)||{};this.setData({input:saved.input||'',messages:saved.messages||[],projectId:saved.projectId||'',greeting:(saved.messages||[]).length?'欢迎回来，我们继续聊你的故事。':'你好，我是你的演讲教练。今天，有什么想说的？'});
  const prefs=wx.getStorageSync('coach_preferences')||{};this.setData({mode:prefs.mode==='general'?'general':'level',speechType:TYPES.some(t=>t.id===prefs.speechType)?prefs.speechType:'auto'});this.refreshSettings();
  this.setData({materialOverrides:saved.materialOverrides||{}});this.refreshProgress();
  const pending=Vault.current();if(pending)this.setData({retryAvailable:true,recoveryMessage:pending.text?'上次识别文字已保存，点击光球继续':'上次录音已保存在本机，点击光球重试，无需重讲'});
  this.player=null;this.voiceQueue=new SpeechQueue({status:text=>{if(!this.closed)this.setData({audioStatus:text});},speaking:value=>{if(!this.closed)this.setData({speaking:value});}});

  this.recorder=wx.getRecorderManager();
  this.recorder.onStart(()=>{if(this.closed){this.recorder.stop();return;}this.setData({recording:true,starting:false,phase:'listening'});});
  this.recorder.onError(()=>{if(!this.closed){this.setData({recording:false,starting:false,phase: "idle"});wx.showToast({title:'无法录音，请检查麦克风权限',icon:'none'});}});
  this.recorder.onStop(async res=>{
   let note;try{note=Vault.capture(res);}catch(e){if(!this.closed){this.setData({recording:false,starting:false,busy:false});this.error(new Error('录音本机保存失败，请检查存储空间'));}return;}
   if(this.closed)return;
   this.setData({recording:false,starting:false,retryAvailable:true,recoveryMessage:'录音已保存在本机'});
   if(!this.hidden)await this.retryRecording();
  });
 },
 onUnload(){this.closed=true;this.stopSpeech();if(this.player)this.player.destroy();if(this.recorder&&(this.data.recording||this.data.starting))this.recorder.stop();},
 onShow(){this.hidden=false;},
 onHide(){this.hidden=true;this.stopSpeech();if(this.recorder&&this.data.recording)this.recorder.stop();},
 error(e){if(!this.closed)wx.showModal({title:'暂未完成',content:e.message||'请求失败，请重试',showCancel:false});},
 persist(){wx.setStorageSync(KEY,{messages:this.data.messages,projectId:this.data.projectId,input:this.data.input,materialOverrides:this.data.materialOverrides});},
 onInput(e){this.setData({input:e.detail.value});},
 stopSpeech(){if(this.voiceQueue)this.voiceQueue.cancel();this.speechVersion=(this.speechVersion||0)+1;if(this.player){this.player.stop();this.player.destroy();this.player=null;}if(!this.closed)this.setData({speaking:false});},
 async retryRecording(){
  if(this.data.busy||this.data.recording||this.data.starting)return;
  let note=Vault.current();if(!note)return;
  if(note.text){this.setData({input:note.text});return this.send();}
  this.setData({busy:true,phase:'recognizing',retryAvailable:false,recoveryMessage:'原录音已保存，正在继续识别…'});
  try{
   if(!note.fileID){const preparation=await call({action:'prepareRecording'});const file=await wx.cloud.uploadFile({cloudPath:preparation.prefix+note.id+'.pcm',filePath:note.path});note=Vault.save({...note,fileID:file.fileID});}
   const requestId=note.requestId||note.id;note=Vault.save({...note,requestId});
   const result=await call.progressive({action:'transcribe',audioFileID:note.fileID,requestId},null,()=>this.closed||this.hidden);
   if(this.closed)return;note=Vault.save({...note,text:result.text,status:'transcribed'});
   this.setData({input:note.text,busy:false,recoveryMessage:'语音已识别，正在发送给教练'});await this.send();
  }catch(e){if(e.terminal)Vault.save({...note,requestId:note.id+'_'+Date.now()});if(!this.closed){this.setData({retryAvailable:true,recoveryMessage:'录音已保存，点击光球继续重试，无需重讲'});this.error(e);}}
  finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
 },
 speak(text){this.stopSpeech();if(this.voiceQueue)this.voiceQueue.append(text,true);},
 onRecord(){
  if(this.data.busy||this.data.starting)return;this.stopSpeech();
  if(!this.data.recording&&Vault.current())return this.retryRecording();
  if(this.data.recording){this.recorder.stop();return;}
  const begin=()=>{if(this.closed)return;const start=()=>{if(this.closed)return;this.setData({starting:true});this.recorder.start({duration:60000,sampleRate:16000,numberOfChannels:1,format:'PCM'});};if(wx.requirePrivacyAuthorize)wx.requirePrivacyAuthorize({success:start,fail:()=>wx.showToast({title:'请先同意隐私授权',icon:'none'})});else start();};
  if(wx.getStorageSync('voice_coach_consent_v1'))begin();else wx.showModal({title:'开启语音对话',content:'录音将发送至 DeepSeek 识别，结束后自动发送给教练。每段最多60秒，识别文字可在对话记录中查看。',success:r=>{if(r.confirm){wx.setStorageSync('voice_coach_consent_v1',true);begin();}}});
 },
 refreshProgress(){this.setData({materialProgress:Materials.derive(this.data.messages,this.data.speechType,this.data.materialOverrides)});},
 toggleProgress(){this.setData({showProgress:!this.data.showProgress});},
 toggleMaterial(e){const key=e.currentTarget.dataset.id;const item=this.data.materialProgress.items.find(i=>i.id===key);if(!item)return;this.setData({materialOverrides:{...this.data.materialOverrides,[key]:!item.done}});this.refreshProgress();this.persist();},
 refreshSettings(){
  const profile=wx.getStorageSync('user_member_profile')||{};const level=['G1','G2','G3'].includes(profile.level)?profile.level:'G1';
  this.setData({modeLabel:this.data.mode==='general'?'通用模式':level+' 等级引导',typeLabel:TYPES.find(t=>t.id===this.data.speechType).name});
 },
 context(){const profile=wx.getStorageSync('user_member_profile')||{};return {mode:this.data.mode,level:['G1','G2','G3'].includes(profile.level)?profile.level:'G1',speechType:this.data.speechType};},
 chooseMode(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:['按我的学习等级引导','通用模式（不限定等级）'],success:r=>{this.setData({mode:r.tapIndex===1?'general':'level'});this.saveSettings();}});},
 chooseType(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:TYPES.map(t=>t.name),success:r=>{this.setData({speechType:TYPES[r.tapIndex].id,detectedLabel:''});this.saveSettings();}});},
 saveSettings(){wx.setStorageSync('coach_preferences',{mode:this.data.mode,speechType:this.data.speechType});this.refreshSettings();this.setData({materialOverrides:{}});this.refreshProgress();},
 toggleDetails(){this.setData({showDetails:!this.data.showDetails});},
 more(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showActionSheet({itemList:['查看对话 / 文字补充','整理成稿','开始新对话','重播最近回复'],success:r=>{if(r.tapIndex===0)this.toggleDetails();if(r.tapIndex===1)this.draft();if(r.tapIndex===2)this.fresh();if(r.tapIndex===3){const last=this.data.messages.filter(m=>m.role==='assistant').slice(-1)[0];if(last)this.speak(last.content);}}});},
 async send(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.input.trim())return;
  this.stopSpeech();const messages=[...this.data.messages,{role:'user',content:this.data.input.trim()}];
  let note=Vault.current();const replyId=note&&note.replyText===messages[messages.length-1].content?note.replyId:null;const requestId=replyId||('coach_'+Date.now()+'_'+Math.random().toString(36).slice(2,9));if(note)Vault.save({...note,replyId:requestId,replyText:messages[messages.length-1].content});this.setData({materialProgress:Materials.derive(messages,this.data.speechType,this.data.materialOverrides)});
  const contextMessages=messages.length>21?[...messages.slice(0,2),...messages.slice(-19)]:messages;
  this.setData({busy:true,input:'',partialReply:'',lastSpoken:messages[messages.length-1].content,phase:'thinking'});
  try{const result=await call.progressive({action:'coach',requestId,messages:contextMessages,coaching:this.context()},text=>{if(!this.closed){this.setData({partialReply:text});this.voiceQueue.append(text);}},()=>this.closed);if(this.closed)return;
   this.setData({partialReply:'',messages:[...messages,{role:'assistant',content:result.text}],detectedLabel:(TYPES.find(t=>t.id===result.detectedType)||{}).name||'',sources:result.sources||[],scrollTo:'msg-'+messages.length});this.refreshProgress();this.persist();Vault.complete();this.setData({retryAvailable:false,recoveryMessage:''});this.voiceQueue.append(result.text,true);
  }catch(e){if(e.terminal&&Vault.current())Vault.save({...Vault.current(),replyId:null});if(!this.closed){this.setData({input:messages[messages.length-1].content,retryAvailable:!!Vault.current(),recoveryMessage:Vault.current()?'识别文字和录音已保存，点击光球继续':'本轮文字已保留，可重新发送'});this.persist();}this.error(e);}finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
 },
 saveDraftText(raw,partial){
  const draft=parseDraft(raw);let id=this.data.projectId;const old=id&&Storage.getProject(id);
  if(partial){id=Storage.createProject(draft.title+'（待补全）');}
  else if(!old)id=Storage.createProject(draft.title);
  else Storage.saveProjectData(id,{draftHistory:[...(old.draftHistory||[]),{cards:old.cards,createdAt:Date.now()}].slice(-5)});
  Storage.saveProjectMeta({id,title:draft.title+(partial?'（待补全）':'')});
  Storage.saveProjectData(id,{cards:draft.cards.slice(0,30).map((c,i)=>({...c,id:id+'_'+i,durationSec:Math.ceil(c.content.length/2.5),quotes:[]})),coachMessages:this.data.messages,coaching:this.context(),isPartial:!!partial});
  if(!partial)this.setData({projectId:id});this.persist();return id;
 },
 async draft(){
  if(this.data.busy||this.data.recording||this.data.starting||!this.data.messages.length)return;
  this.stopSpeech();this.draftBuffer='';this.setData({busy:true,phase:'drafting',partialReply:''});
  const original=this.data.messages.filter(m=>m.role==='user').map(m=>m.content).join('\n\n');
  if(original.length>35000){this.setData({busy:false,phase:'idle'});this.error(new Error('素材超过单篇处理范围，请分成两篇整理；原对话已保留'));return;}
  const messages=[];for(let i=0;i<original.length;i+=10000)messages.push({role:'user',content:original.slice(i,i+10000)});
  try{
   const result=await call.progressive({action:'draft',messages,coaching:this.context()},text=>{this.draftBuffer=text;wx.setStorageSync('coach_draft_recovery',{text,messages:this.data.messages,updatedAt:Date.now()});if(!this.closed)this.setData({partialReply:text});},()=>this.closed);
   const id=this.saveDraftText(result.text,false);wx.removeStorageSync('coach_draft_recovery');if(!this.closed)wx.navigateTo({url:'/pages/index/index?id='+id});
  }catch(e){
   const recovered=this.draftBuffer.trim();if(recovered.length>20){const id=this.saveDraftText(recovered,true);if(!this.closed)wx.showModal({title:'已保留部分草稿',content:'本次生成未完成，已生成正文已保存为待补全稿件。无需重新讲述。',showCancel:false,success:()=>wx.navigateTo({url:'/pages/index/index?id='+id})});}
   else this.error(new Error((e.message||'整理未完成')+'。原始素材仍在，可再次整理，无需重新讲述。'));
  }finally{if(!this.closed)this.setData({busy:false,phase:'idle'});}
 },
 fresh(){if(this.data.busy||this.data.recording||this.data.starting)return;wx.showModal({title:'开始新对话',content:'当前对话将清空；已生成的稿件仍保留在首页。',success:r=>{if(r.confirm){this.setData({materialOverrides:{},greeting:'你好，这次有什么想表达的？',detectedLabel:'',partialReply:'',lastSpoken:'',messages:[],input:'',projectId:'',sources:[]});this.refreshProgress();this.persist();}}});}
});
