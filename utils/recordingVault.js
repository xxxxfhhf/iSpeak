const KEY='coach_pending_recording';
exports.current=()=>wx.getStorageSync(KEY)||null;
exports.save=function(note){wx.setStorageSync(KEY,note);return note;};
exports.capture=function(res){
 const id='voice_'+Date.now()+'_'+Math.random().toString(36).slice(2,9);
 const path=wx.env.USER_DATA_PATH+'/'+id+'.pcm';
 wx.getFileSystemManager().copyFileSync(res.tempFilePath,path);
 const note={id,path,createdAt:Date.now(),status:'saved',duration:res.duration||0};return exports.save(note);
};
exports.complete=function(){const note=exports.current();if(!note)return;const history=wx.getStorageSync('coach_recording_archive')||[];history.push({...note,status:'completed'});wx.setStorageSync('coach_recording_archive',history);wx.removeStorageSync(KEY);};
