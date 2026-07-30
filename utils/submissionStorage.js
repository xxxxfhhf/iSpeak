/**
 * 演练资料图片持久化
 * 当前默认本地保存（wx.saveFile → 用户目录）；未来可切换为 cloud
 */
const IMAGE_STORAGE_MODE = 'local'; // 'local' | 'cloud'

/** 保存单张图片到本地用户目录，返回 { storage: 'local', path } */
function saveLocalImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    wx.getFileSystemManager().saveFile({
      tempFilePath,
      success: res => resolve({ storage: 'local', path: res.savedFilePath }),
      fail: reject
    });
  });
}

/** 批量本地保存 */
async function saveLocalImages(tempPaths) {
  const results = [];
  for (const p of tempPaths) {
    results.push(await saveLocalImage(p));
  }
  return results;
}

/** 上传单张图片到云存储（预留，IMAGE_STORAGE_MODE === 'cloud' 时使用） */
function uploadCloudImage(tempFilePath) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'));
      return;
    }
    const extMatch = tempFilePath.match(/\.(\w+)(\?|$)/);
    const ext = extMatch ? extMatch[1] : 'jpg';
    const cloudPath = `submissions/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: res => resolve({ storage: 'cloud', fileID: res.fileID }),
      fail: reject
    });
  });
}

async function uploadCloudImages(tempPaths) {
  const results = [];
  for (const p of tempPaths) {
    results.push(await uploadCloudImage(p));
  }
  return results;
}

/**
 * 持久化提交图片（按配置走本地或云）
 * @param {string[]} tempPaths 临时路径列表
 */
async function persistSubmissionImages(tempPaths) {
  if (!tempPaths || !tempPaths.length) return [];
  if (IMAGE_STORAGE_MODE === 'cloud') {
    return uploadCloudImages(tempPaths);
  }
  return saveLocalImages(tempPaths);
}

/** 检查本地文件是否仍可访问 */
function isLocalFileAccessible(filePath) {
  if (!filePath) return false;
  try {
    wx.getFileSystemManager().accessSync(filePath);
    return true;
  } catch (e) {
    return false;
  }
}

/** 将存储的图片记录解析为可显示的 URL 列表 */
async function resolveImageUrls(images) {
  if (!images || !images.length) return [];

  const cloudFileIDs = images
    .filter(i => {
      if (typeof i !== 'object') return false;
      if (i.storage === 'cloud' && i.fileID) return true;
      // 兼容旧云存储数据
      return i.fileID && i.storage !== 'local';
    })
    .map(i => i.fileID);

  let urlMap = {};
  if (cloudFileIDs.length && wx.cloud) {
    try {
      const res = await wx.cloud.getTempFileURL({ fileList: cloudFileIDs });
      (res.fileList || []).forEach(f => {
        if (f.tempFileURL) urlMap[f.fileID] = f.tempFileURL;
      });
    } catch (e) {
      console.warn('getTempFileURL fail', e);
    }
  }

  return images.map(i => {
    if (typeof i === 'object') {
      if (i.storage === 'local' && i.path) {
        return isLocalFileAccessible(i.path) ? i.path : '';
      }
      if (i.fileID) {
        return urlMap[i.fileID] || '';
      }
    }
    if (typeof i === 'string') {
      return isLocalFileAccessible(i) ? i : '';
    }
    return '';
  }).filter(Boolean);
}

function getStorageMode() {
  return IMAGE_STORAGE_MODE;
}

module.exports = {
  IMAGE_STORAGE_MODE,
  getStorageMode,
  saveLocalImage,
  saveLocalImages,
  uploadCloudImage,
  uploadCloudImages,
  persistSubmissionImages,
  resolveImageUrls,
  // 兼容旧引用
  uploadImages: persistSubmissionImages
};
