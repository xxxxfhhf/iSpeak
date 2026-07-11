// pages/learn/submit/submit.js — 按路径项目提交材料（图片本地持久化，支持回看）
const { persistSubmissionImages, resolveImageUrls } = require('../../../utils/submissionStorage.js');

const PROGRESS_KEY = 'user_path_progress';
const SUBMISSIONS_KEY = 'user_submissions';

Page({
  data: {
    pathId: '',
    itemId: '',
    storageKey: '',
    textContent: '',
    images: [],
    history: [],
    viewingItem: null,
    submitting: false
  },

  onLoad(options) {
    const { pathId, itemId } = options;
    const storageKey = itemId ? `${pathId}:${itemId}` : pathId;
    this.setData({ pathId, itemId, storageKey });
    this.loadHistory();
  },

  onShow() {
    this.loadHistory();
  },

  /** 加载提交记录并解析图片 URL */
  async loadHistory() {
    const all = wx.getStorageSync(SUBMISSIONS_KEY) || {};
    const rawList = all[this.data.storageKey] || [];
    const history = [];
    for (const item of rawList) {
      const displayImages = await resolveImageUrls(item.images || []);
      history.push({
        ...item,
        displayImages,
        timeStr: this.formatTime(item.createdAt),
        imageCount: (item.images || []).length
      });
    }
    this.setData({ history });
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

  /** 提交：图片保存到本地用户目录（未来可切换云存储） */
  async onSubmit() {
    const { storageKey, textContent, images, submitting } = this.data;
    if (submitting) return;
    if (!textContent.trim() && images.length === 0) {
      wx.showToast({ title: '请填写内容或添加图片', icon: 'none' });
      return;
    }

    this.setData({ submitting: true });
    wx.showLoading({ title: '保存中...', mask: true });

    try {
      let savedImages = [];
      if (images.length) {
        savedImages = await persistSubmissionImages(images);
      }

      const allSub = wx.getStorageSync(SUBMISSIONS_KEY) || {};
      const list = allSub[storageKey] || [];
      list.unshift({
        id: Date.now().toString(),
        createdAt: Date.now(),
        text: textContent.trim(),
        images: savedImages
      });
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
      await this.loadHistory();
    } catch (err) {
      console.error('submit fail', err);
      wx.showModal({
        title: '保存失败',
        content: '图片保存失败，请重试。若仍失败可尝试减少图片数量。',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
      this.setData({ submitting: false });
    }
  },

  /** 点击查看提交详情 */
  onViewHistory(e) {
    const item = this.data.history[e.currentTarget.dataset.index];
    if (item) this.setData({ viewingItem: item });
  },

  onCloseDetail() {
    this.setData({ viewingItem: null });
  },

  preventBubble() {},

  /** 预览历史图片 */
  onPreviewHistoryImage(e) {
    const url = e.currentTarget.dataset.url;
    const urls = e.currentTarget.dataset.urls || [url];
    wx.previewImage({ current: url, urls });
  },

  /** 预览当前待提交图片 */
  onPreviewPendingImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({ current: url, urls: this.data.images });
  }
});
