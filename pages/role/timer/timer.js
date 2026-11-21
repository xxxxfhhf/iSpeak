/**
 * 时间牌 — 支持自定义总时长与绿/黄/红触发规则（按剩余秒数）
 * 规则本地保存：user_timer_rules
 */
const RULES_KEY = 'user_timer_rules';

const DEFAULT_RULES = {
  totalSec: 180,
  greenSec: 60,
  yellowSec: 30
};

Page({
  data: {
    totalMinLabel: '3',
    yellowMinLabel: '0.5',
    totalMin: 3,
    totalSecPart: 0,
    greenSec: 60,
    yellowSec: 30,
    totalSec: 180,
    remainSec: 180,
    card: 'green',
    running: false,
    timerId: null,
    timeStr: '3:00',
    showCustom: false,
    presets: [2, 3, 5, 7]
  },

  onLoad() {
    this.loadRules();
  },

  onUnload() {
    this.stopTimer();
  },

  /** 读取本地自定义规则 */
  loadRules() {
    const saved = wx.getStorageSync(RULES_KEY) || {};
    const rules = { ...DEFAULT_RULES, ...saved };
    const totalMin = Math.floor(rules.totalSec / 60);
    const totalSecPart = rules.totalSec % 60;
    this.applyRules(rules.totalSec, rules.greenSec, rules.yellowSec, false);
    this.setData({ totalMin, totalSecPart, greenSec: rules.greenSec, yellowSec: rules.yellowSec });
  },

  applyRules(totalSec, greenSec, yellowSec, resetRunning) {
    const safeTotal = Math.max(10, Number(totalSec) || 180);
    let g = Math.max(0, Number(greenSec) || 0);
    let y = Math.max(0, Number(yellowSec) || 0);
    if (g > safeTotal) g = safeTotal;
    if (y > g) y = g;
    this.stopTimer();
    this.setData({
      totalMinLabel: String(Number((safeTotal / 60).toFixed(2))),
      yellowMinLabel: String(Number((y / 60).toFixed(2))),
      totalSec: safeTotal,
      greenSec: g,
      yellowSec: y,
      remainSec: safeTotal,
      card: 'green',
      timeStr: this._fmt(safeTotal),
      running: false,
      totalMin: Math.floor(safeTotal / 60),
      totalSecPart: safeTotal % 60
    });
    if (resetRunning === false) return;
  },

  _fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  onToggleCustom() {
    this.setData({ showCustom: !this.data.showCustom });
  },

  onSetDuration(e) {
    const min = parseInt(e.currentTarget.dataset.min, 10);
    const totalSec = min * 60;
    // 预设：绿=总时长1/3，黄=总时长1/6（至少 15 秒）
    const greenSec = Math.max(30, Math.floor(totalSec / 3));
    const yellowSec = Math.max(15, Math.floor(totalSec / 6));
    this.applyRules(totalSec, greenSec, yellowSec);
  },

  onInputMin(e) {
    this.setData({ totalMin: parseInt(e.detail.value, 10) || 0 });
  },

  onInputSecPart(e) {
    this.setData({ totalSecPart: parseInt(e.detail.value, 10) || 0 });
  },

  onInputGreen(e) {
    this.setData({ greenSec: parseInt(e.detail.value, 10) || 0 });
  },

  onInputYellowMin(e) {
    this.setData({ yellowSec: Math.round((Number(e.detail.value) || 0) * 60) });
  },

  onInputYellow(e) {
    this.setData({ yellowSec: parseInt(e.detail.value, 10) || 0 });
  },

  /** 保存并应用自定义规则 */
  onSaveRules() {
    let { totalMin, totalSecPart, greenSec, yellowSec } = this.data;
    totalSecPart = Math.min(59, Math.max(0, totalSecPart));
    const totalSec = Math.max(10, totalMin * 60 + totalSecPart);
    greenSec = totalSec;
    if (yellowSec <= 0 || yellowSec >= totalSec) {
      wx.showToast({ title: '黄牌时长需大于0且小于总时长', icon: 'none' });
      return;
    }
    if (greenSec > totalSec) {
      wx.showToast({ title: '绿牌不能超过总时长', icon: 'none' });
      return;
    }
    const rules = { totalSec, greenSec, yellowSec };
    wx.setStorageSync(RULES_KEY, rules);
    this.applyRules(totalSec, greenSec, yellowSec);
    wx.showToast({ title: '规则已保存', icon: 'success' });
  },

  onStart() {
    if (this.data.running) return;
    const timerId = setInterval(() => this.tick(), 1000);
    this.setData({ running: true, timerId, card: this.data.remainSec <= 0 ? 'red' : this.data.remainSec <= this.data.yellowSec ? 'yellow' : 'green' });
  },

  onPause() {
    this.stopTimer();
    this.setData({ running: false });
  },

  onReset() {
    this.stopTimer();
    this.setData({
      running: false,
      remainSec: this.data.totalSec,
      card: 'green',
      timeStr: this._fmt(this.data.totalSec)
    });
  },

  stopTimer() {
    if (this.data.timerId) clearInterval(this.data.timerId);
    this.setData({ timerId: null });
  },

  /** 按自定义剩余秒数判定牌色 */
  tick() {
    let { remainSec, greenSec, yellowSec } = this.data;
    if (remainSec <= 0) {
      this.stopTimer();
      this.setData({ running: false, card: 'red', remainSec: 0, timeStr: '0:00' });
      wx.vibrateShort({ type: 'heavy' });
      return;
    }
    remainSec -= 1;
    const card = remainSec <= 0 ? 'red' : remainSec <= yellowSec ? 'yellow' : 'green';
    this.setData({ remainSec, card, timeStr: this._fmt(remainSec) });
    if (remainSec === 0) {
      this.stopTimer();
      this.setData({ running: false });
      wx.vibrateShort({ type: 'heavy' });
    }
  }
});
