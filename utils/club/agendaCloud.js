/**
 * 议程云存储 — 分享链接供他人查看与协作填写
 * 需在云开发控制台创建集合 meeting_agendas，权限建议：所有用户可读，仅创建者可写（或所有用户可写以便协作）
 */
const COLLECTION = 'meeting_agendas';
const LOCAL_KEY = 'local_agenda_drafts';

function getDb() {
  if (!wx.cloud) return null;
  return wx.cloud.database();
}

/** 保存到云端，返回 docId */
async function saveAgendaToCloud(agenda, docId) {
  const db = getDb();
  if (!db) throw new Error('云开发未初始化');
  const payload = { ...agenda, updatedAt: Date.now() };
  if (docId) {
    await db.collection(COLLECTION).doc(docId).update({ data: payload });
    return docId;
  }
  payload.createdAt = Date.now();
  const res = await db.collection(COLLECTION).add({ data: payload });
  return res._id;
}

/** 从云端加载 */
async function loadAgendaFromCloud(docId) {
  const db = getDb();
  if (!db) throw new Error('云开发未初始化');
  const res = await db.collection(COLLECTION).doc(docId).get();
  return res.data;
}

/** 本地草稿 */
function saveLocalDraft(agenda) {
  const id = agenda.localId || Date.now().toString();
  const all = wx.getStorageSync(LOCAL_KEY) || {};
  all[id] = { ...agenda, localId: id, updatedAt: Date.now() };
  wx.setStorageSync(LOCAL_KEY, all);
  return id;
}

function loadLocalDraft(id) {
  const all = wx.getStorageSync(LOCAL_KEY) || {};
  return all[id] || null;
}

function listLocalDrafts() {
  const all = wx.getStorageSync(LOCAL_KEY) || {};
  return Object.values(all).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

module.exports = {
  COLLECTION,
  saveAgendaToCloud,
  loadAgendaFromCloud,
  saveLocalDraft,
  loadLocalDraft,
  listLocalDrafts
};
