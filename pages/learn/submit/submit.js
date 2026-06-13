// pages/learn/submit/submit.js — 按路径项目提交材料
const PROGRESS_KEY = 'user_path_progress';
const SUBMISSIONS_KEY = 'user_submissions';

Page({
  data: {
    pathId: '',
    itemId: '',
    storageKey: '',
    textContent: '',
    images: [],
    history: []
  },

  onLoad(options) {
    const { pathId, itemId } = options;
    const storageKey = itemId ? `${pathId}:${itemId}` : pathId;
    this.setData({ pathId, itemId, storageKey });
    this.loadHistory();
  },

  loadHistory() {
    const all = wx.getStorageSync(SUBMISSIONS_KEY) || {};
    const list = (all[this.data.storageKey] || []).map(item => ({
      ...item,
      timeStr: this.formatTime(item.createdAt)
    }));
    this.setData({ history: list });
  },

  formatTime(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  },

  onTextInput(e) {
    this.setData({ textContent: e.detail.value });
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...newImages] });
      }
    });
  },

  onRemoveImage(e) {
    const images = [...this.data.images];
    images.splice(e.currentTarget.dataset.index, 1);
    this.setData({ images });
  },

  onSubmit() {
    const { storageKey, textContent, images } = this.data;
    if (!textContent.trim() && images.length === 0) {
      wx.showToast({ title: '请填写内容或添加图片', icon: 'none' });
      return;
    }

    const allSub = wx.getStorageSync(SUBMISSIONS_KEY) || {};
    const list = allSub[storageKey] || [];
    list.unshift({ id: Date.now().toString(), createdAt: Date.now(), text: textContent.trim(), images: [...images] });
    allSub[storageKey] = list;
    wx.setStorageSync(SUBMISSIONS_KEY, allSub);

    const progressMap = wx.getStorageSync(PROGRESS_KEY) || {};
    const prog = progressMap[storageKey] || {};
    progressMap[storageKey] = {
      ...prog,
      hasSubmission: true,
      isCompleted: !!(prog.isOfflinePassed),
      updatedAt: Date.now()
    };
    wx.setStorageSync(PROGRESS_KEY, progressMap);

    wx.showToast({ title: '提交成功', icon: 'success' });
    this.setData({ textContent: '', images: [] });
    this.loadHistory();
  }
});
