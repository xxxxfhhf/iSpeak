const call=require('./speechAI');
const normalizeWav=require('./wavAudio');
class SpeechQueue{
 constructor(options){this.options=options;this.version=0;this.reset();}
 reset(){this.text='';this.buffer='';this.waiting=[];this.ready=[];this.synthesizing=false;this.playing=false;this.sentences=0;this.audioFiles=[];}
 cancel(){this.version++;if(this.player){this.player.stop();this.player.destroy();this.player=null;}if(this.finishPlay){this.finishPlay();this.finishPlay=null;}for(const path of this.audioFiles||[]){try{wx.getFileSystemManager().unlinkSync(path);}catch(e){}}this.reset();this.options.speaking(false);this.options.status('');}
 append(text,final=false){
  if(typeof text!=='string')return;if(!text.startsWith(this.text)){this.cancel();}
  this.buffer+=text.slice(this.text.length);this.text=text;
  while(this.buffer.trim()){
   const minimum=this.sentences===0?10:24;let cut=-1;
   for(let i=0;i<this.buffer.length;i++){if(/[。！？!?；;\n]/.test(this.buffer[i])||(i>=minimum&&/[，,：:]/.test(this.buffer[i]))){cut=i+1;break;}}
   if(cut<0&&this.buffer.length>=80)cut=80;
   if(cut<0&&final)cut=this.buffer.length;
   if(cut<0)break;const part=this.buffer.slice(0,cut).replace(/[#*`]/g,'').trim();this.buffer=this.buffer.slice(cut);if(part){this.waiting.push(part);this.sentences++;}
  }
  this.synthesize();
 }
 async synthesize(){
  if(this.synthesizing||!this.waiting.length||this.ready.length>=2)return;
  this.synthesizing=true;const version=this.version,text=this.waiting.shift();
  if(!this.playing&&!this.ready.length)this.options.status('正在准备首句声音…');
  try{
   const result=await call({action:'speak',text});if(version!==this.version)return;
   const file=await wx.cloud.downloadFile({fileID:result.audioFileID});if(version!==this.version)return;
   const raw=normalizeWav(wx.getFileSystemManager().readFileSync(file.tempFilePath));
   const local=wx.env.USER_DATA_PATH+'/coach-sentence-'+Date.now()+'-'+Math.random().toString(36).slice(2)+'.wav';wx.getFileSystemManager().writeFileSync(local,raw);this.audioFiles.push(local);this.ready.push(local);this.play();
  }catch(e){if(version===this.version)this.options.status('本句声音未播出：'+(e.message||e.errMsg||'请求失败')+'；文字已保留');}
  finally{if(version===this.version){this.synthesizing=false;this.synthesize();}}
 }
 async play(){
  if(this.playing||!this.ready.length)return;
  const version=this.version,path=this.ready.shift();this.playing=true;this.synthesize();
  try{await new Promise((resolve,reject)=>{
   const player=wx.createInnerAudioContext();this.player=player;this.finishPlay=resolve;player.obeyMuteSwitch=false;
   player.onPlay(()=>{if(version===this.version){this.options.speaking(true);this.options.status('');}});
   player.onEnded(resolve);player.onError(e=>reject(new Error('解码或播放失败（'+(e.errCode||'未知')+'）：'+(e.errMsg||''))));player.src=path;player.play();
  });}catch(e){if(version===this.version)this.options.status(e.message+'；可在菜单重播');}
  finally{if(version===this.version){if(this.player){this.player.destroy();this.player=null;}this.finishPlay=null;this.playing=false;this.options.speaking(false);try{wx.getFileSystemManager().unlinkSync(path);}catch(e){}this.audioFiles=this.audioFiles.filter(p=>p!==path);this.play();this.synthesize();}}
 }
}
module.exports=SpeechQueue;
