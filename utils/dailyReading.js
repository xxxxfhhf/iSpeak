/**
 * 每日朗读素材 — 客户端读取封装
 * 数据由云函数 dailyMaterial 写入云库集合 daily_materials(date 为 _id)。
 * 集合权限建议:所有用户可读,仅创建者(云函数)可写。
 */
const COLLECTION = 'daily_materials';
const CACHE_KEY = 'daily_material_cache';

/** 本地日期字符串 YYYY-MM-DD */
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 获取今日素材。优先本地缓存 → 云库 → (缺失时)触发云函数生成后再读。
 * @param {{generateIfMissing?: boolean}} opts
 * @returns {Promise<object|null>}
 */
async function getTodayMaterial({ generateIfMissing = true } = {}) {
  const date = todayStr();
  const cache = wx.getStorageSync(CACHE_KEY);
  if (cache && cache.date === date && cache.data) return cache.data;

  if (!wx.cloud) throw new Error('云开发未初始化');
  const db = wx.cloud.database();

  let data = null;
  try {
    const res = await db.collection(COLLECTION).doc(date).get();
    data = res.data;
  } catch (e) {
    // 文档不存在会抛错 → 当天尚未生成
    if (generateIfMissing) {
      try {
        await wx.cloud.callFunction({ name: 'dailyMaterial', data: { date } });
        const res2 = await db.collection(COLLECTION).doc(date).get();
        data = res2.data;
      } catch (e2) {
        console.warn('[dailyReading] 生成/读取今日素材失败:', e2);
        data = null;
      }
    }
  }

  if (data) wx.setStorageSync(CACHE_KEY, { date, data });
  return data;
}

/** 往期素材列表(按日期倒序) */
async function getRecentMaterials(limit = 10) {
  if (!wx.cloud) throw new Error('云开发未初始化');
  const db = wx.cloud.database();
  const res = await db.collection(COLLECTION).orderBy('date', 'desc').limit(limit).get();
  return res.data || [];
}

/**
 * 分页获取往期素材(按日期倒序)。
 * 小程序端单次查询上限 20 条,归档页用 skip 分页加载。
 * @param {{skip?: number, limit?: number}} opts
 * @returns {Promise<Array>}
 */
async function getMaterialsPage({ skip = 0, limit = 20 } = {}) {
  if (!wx.cloud) throw new Error('云开发未初始化');
  const db = wx.cloud.database();
  const res = await db.collection(COLLECTION)
    .orderBy('date', 'desc')
    .skip(skip)
    .limit(Math.min(limit, 20))
    .get();
  return res.data || [];
}

/** 按日期获取指定一天的素材(归档页查看历史,不走今日缓存) */
async function getMaterialByDate(date) {
  if (!wx.cloud) throw new Error('云开发未初始化');
  const db = wx.cloud.database();
  try {
    const res = await db.collection(COLLECTION).doc(date).get();
    return res.data || null;
  } catch (e) {
    return null;
  }
}

/** 清掉今日缓存(强制重新生成后调用) */
function clearTodayCache() {
  wx.removeStorageSync(CACHE_KEY);
}

module.exports = { getTodayMaterial, getRecentMaterials, getMaterialsPage, getMaterialByDate, clearTodayCache, todayStr };
