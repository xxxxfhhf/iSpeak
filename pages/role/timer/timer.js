const RULES_KEY = 'user_timer_rules_v2';
Page({
 data: { totalMin: 3, greenMin: 1, yellowMin: 0.5, bellMin: 0.5, totalSec: 180, greenSec: 60, yellowSec: 30, bellSec: 30, remainSec: 180, card: 'none', timeStr: '3:00', running: false, finished: false, showCustom: false, mode: 'standard', presets: [2,3,5,7] },
 onLoad() {
  this.audio = wx.createInnerAudioContext();
  this.audio.src = '/assets/audio/timer-bell.wav';
  this.audio.obeyMuteSwitch = false;
  this.audio.onError(() => wx.showToast({ title: '铃声播放失败，请检查媒体音量', icon: 'none' }));
  const saved = wx.getStorageSync(RULES_KEY);
  if (saved && this.valid(saved)) this.apply(saved); else this.apply(this.standard(180));
 },
 onUnload() { this.stopTimer(); if (this.audio) this.audio.destroy(); wx.setKeepScreenOn({ keepScreenOn: false }); },
 standard(totalSec) { return { totalSec, greenSec: totalSec <= 180 ? 60 : 120, yellowSec: totalSec <= 180 ? 30 : 60, bellSec: 30, mode: 'standard' }; },
 valid(r) { return [r.totalSec,r.greenSec,r.yellowSec,r.bellSec].every(Number.isFinite) && r.totalSec > 0 && r.greenSec > r.yellowSec && r.yellowSec > 0 && r.bellSec > 0 && r.bellSec <= 3600 && (r.mode === 'standard' || r.greenSec <= r.totalSec); },
 color(left) { return left <= 0 ? 'red' : left <= this.data.yellowSec ? 'yellow' : left <= this.data.greenSec ? 'green' : 'none'; },
 fmt(sec) { const n = Math.abs(sec); return Math.floor(n/60) + ':' + String(n%60).padStart(2,'0'); },
 apply(r) {
  this.stopTimer(); if (this.audio) this.audio.stop();
  this.setData({ ...r, totalMin: r.totalSec/60, greenMin: r.greenSec/60, yellowMin: r.yellowSec/60, bellMin: r.bellSec/60, remainSec: r.totalSec, running: false, finished: false, timeStr: this.fmt(r.totalSec) });
  this.setData({ card: this.color(r.totalSec) });
 },
 onToggleCustom() { this.setData({ showCustom: !this.data.showCustom }); },
 onInput(e) { this.setData({ [e.currentTarget.dataset.field]: e.detail.value }); },
 onSetDuration(e) { const r = this.standard(Number(e.currentTarget.dataset.min)*60); this.apply(r); wx.setStorageSync(RULES_KEY,r); },
 onSaveRules() {
  const r = { totalSec: Math.round(Number(this.data.totalMin)*60), greenSec: Math.round(Number(this.data.greenMin)*60), yellowSec: Math.round(Number(this.data.yellowMin)*60), bellSec: Math.round(Number(this.data.bellMin)*60), mode: 'custom' };
  if (!this.valid(r)) { wx.showToast({ title: '需满足：总时长≥绿牌>黄牌>0，响铃延时为0–60 min之间', icon: 'none' }); return; }
  this.apply(r); wx.setStorageSync(RULES_KEY,r); wx.showToast({ title: '自定义规则已保存' });
 },
 onStandard() { const total = Math.round(Number(this.data.totalMin)*60); if (!Number.isFinite(total) || total <= 0) return; const r=this.standard(total); this.apply(r); wx.setStorageSync(RULES_KEY,r); },
 onStart() {
  if (this.data.running || this.data.finished) return;
  this.deadline = Date.now() + this.data.remainSec*1000;
  this.setData({ running: true }); wx.setKeepScreenOn({ keepScreenOn: true });
  this.timer = setInterval(() => this.tick(),200);
 },
 stopTimer() { if (this.timer) clearInterval(this.timer); this.timer=null; },
 onPause() { if (this.data.running) this.tick(); this.stopTimer(); this.setData({ running: false }); wx.setKeepScreenOn({ keepScreenOn: false }); },
 onReset() { const {totalSec,greenSec,yellowSec,bellSec,mode}=this.data; this.apply({totalSec,greenSec,yellowSec,bellSec,mode}); wx.setKeepScreenOn({ keepScreenOn: false }); },
 tick() {
  const left = Math.max(-this.data.bellSec,Math.ceil((this.deadline-Date.now())/1000));
  this.setData({ remainSec: left, card: this.color(left), timeStr: this.fmt(left) });
  if (left <= -this.data.bellSec && !this.data.finished) {
   this.stopTimer(); this.setData({ running: false, finished: true });
   if (this.audio) { this.audio.stop(); this.audio.play(); }
   wx.vibrateLong(); wx.showModal({ title: '必须结束演讲', content: '已达到超时响铃时间，请立即结束演讲。', showCancel: false });
  }
 }
});
