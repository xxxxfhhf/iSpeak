// 云函数:每日朗读素材抓取
// 定时触发(见 config.json)或手动调用(event.force=true 强制重生成)
// 服务端 HTTP 不受小程序合法域名白名单限制,可直接抓取公开源
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const https = require('https');

const COLLECTION = 'daily_materials';

// —— 公版经典故事/寓言种子(均已进入公有领域,按日轮换,中外兼收)——
// 无稳定的“经典故事”开放 API,故内置公版语料;后续可替换为网络源
const STORY_SEEDS = [
  {
    title: '龟兔赛跑', origin: '伊索寓言（古希腊·公有领域）',
    content: '兔子嘲笑乌龟爬得慢,乌龟却提出赛跑。发令后兔子飞奔在前,自恃领先便在半途睡去;乌龟不停不歇,一步步向前,终于率先抵达终点。骄傲使人落后,坚持让人抵达。'
  },
  {
    title: '牧童与狼', origin: '伊索寓言（古希腊·公有领域）',
    content: '牧童多次谎喊“狼来了”戏弄村人,村人几番奔来救援,却总不见狼。待真的狼群闯入羊圈时,他再声嘶力竭地呼救,却无人再信、无人再来。谎言重复,终会耗尽所有人的信任。'
  },
  {
    title: '守株待兔', origin: '《韩非子》（先秦·公有领域）',
    content: '宋国有个农夫,见一只兔子撞死在田边树桩上,便扔下农具守在树旁,盼再有兔子撞来。兔子再没出现,田地却因此荒芜,他也成了国人的笑谈。守着偶然,便会错过必然的耕耘。'
  },
  {
    title: '农夫与蛇', origin: '伊索寓言（古希腊·公有领域）',
    content: '寒冬里农夫见一条冻僵的蛇,心生怜悯,把它揣进怀中取暖。蛇苏醒后,本性发作,狠狠咬了农夫一口。善意需要分辨对象,否则怜悯反成祸端。'
  }
];

// —— 通用 HTTPS GET,返回解析后的 JSON ——
// 注意:云函数默认执行超时仅 3 秒,单次抓取必须更快,否则整个函数会被终止
function httpsGetJson(url, timeout = 2500) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON解析失败: ' + String(data).slice(0, 120))); }
      });
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => req.destroy(new Error('请求超时')));
  });
}

// —— 各来源 provider:每个独立 try/catch,单点失败不影响整体 ——
async function fetchPoem() {
  const r = await httpsGetJson('https://v1.jinrishici.com/all.json');
  if (!r || !r.content) throw new Error('诗词为空');
  return {
    kind: 'poem', title: r.origin || '', author: r.author || '',
    dynasty: r.category || '', content: r.content,
    source: '今日诗词', sourceUrl: 'https://www.jinrishici.com'
  };
}

async function fetchQuoteCn() {
  // c=d 文学 / c=i 诗词 / c=k 哲学
  const r = await httpsGetJson('https://v1.hitokoto.cn/?c=d&c=i&c=k&encode=json');
  if (!r || !r.hitokoto) throw new Error('金句为空');
  return {
    kind: 'quote_cn', text: r.hitokoto, title: r.from || '',
    author: r.from_who || '', source: '一言 hitokoto'
  };
}

async function fetchQuoteEn() {
  // 外文金句(尽力而为,若国内网络不可达则自动跳过)
  const r = await httpsGetJson('https://api.quotable.io/random');
  if (!r || !r.content) throw new Error('英文金句为空');
  return { kind: 'quote_en', text: r.content, author: r.author || '', source: 'Quotable' };
}

function pickStory() {
  // 随机选取:强制重新生成时也能换一则,不再按日期固定
  const s = STORY_SEEDS[Math.floor(Math.random() * STORY_SEEDS.length)];
  return { kind: 'story', title: s.title, content: s.content, author: s.origin, source: '公共领域' };
}

// 北京时区(UTC+8)日期字符串 YYYY-MM-DD
function beijingDateStr() {
  const d = new Date(Date.now() + 8 * 3600 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

exports.main = async (event = {}) => {
  const date = event.date || beijingDateStr();
  const force = !!event.force;

  // 幂等:当天已有且非强制,直接跳过,避免重复消耗
  if (!force) {
    const existed = await db.collection(COLLECTION).doc(date).get().catch(() => null);
    if (existed && existed.data) return { ok: true, skipped: true, date };
  }

  const items = [];
  const errors = [];
  // 并行抓取三个外部源,总耗时取最大值而非累加,避免超出云函数执行超时
  const providers = [['poem', fetchPoem], ['quote_cn', fetchQuoteCn], ['quote_en', fetchQuoteEn]];
  const results = await Promise.all(providers.map(async ([name, fn]) => {
    try { return await fn(); }
    catch (e) { errors.push(`${name}: ${e.message}`); return null; }
  }));
  for (const r of results) { if (r) items.push(r); }
  // 经典故事(公版种子,随机选取)
  try {
    items.push(pickStory());
  } catch (e) { errors.push('story: ' + e.message); }

  // TODO(加固): 入库前用 security.msgSecCheck 做内容安全校验
  const doc = { date, items, errors, createdAt: Date.now() };
  await db.collection(COLLECTION).doc(date).set({ data: doc });
  return { ok: true, date, count: items.length, errors };
};
