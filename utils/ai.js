const API_KEY = 'sk-7b7a728f3a8249a5a5b1d857c1ee8217'; // 用户需在此处填入 API Key
const BASE_URL = 'https://api.deepseek.com/v1/chat/completions';

const SYSTEM_PROMPTS = {
  fill: '你是一位资深的演讲教练。请根据用户提供的演讲段落标题和简要大纲，将其填充为一段完整、流畅、具有吸引力的演讲稿。要求：口语化、直接、有力，适合在职场或头马（Toastmasters）场合演讲。',
  oral: '请将以下演讲段落修改得更加口语化。去掉书面语，使用短句，增加语气助词，使其听起来像是在自然对话，而不是在念稿子。',
  vivid: '请为以下演讲段落增加画面感。使用比喻、细节描述或感官词汇（听觉、视觉、触觉），让观众能够身临其境。',
  brief: '请精简以下演讲段落。保留核心观点和金句，去掉冗余的修饰词，使其更加干练、有力。',
  quote: '请根据以下演讲内容，提取或创作 3 条具有穿透力的金句。金句应短小精悍，富有哲理或情感冲击力。',
  complete: '你是一位演讲结构专家。请分析当前的演讲积木序列，指出缺失的关键环节（如开场钩子、转折点、结尾回扣或CTA），并为缺失的环节提供具体的创作建议或直接生成草稿。'
};

const AiService = {
  async callDeepSeek(prompt, content) {
    if (API_KEY === 'YOUR_DEEPSEEK_API_KEY') {
      throw new Error('请先在 utils/ai.js 中配置 DeepSeek API Key');
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: BASE_URL,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: content }
          ],
          temperature: 0.7
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data.choices[0].message.content);
          } else {
            reject(new Error(res.data.error?.message || '请求失败'));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },

  async refineCard(action, card, projectContext = '') {
    const prompt = SYSTEM_PROMPTS[action];
    const content = `项目背景：${projectContext}\n当前积木标题：${card.title}\n当前积木内容：${card.content}`;
    return this.callDeepSeek(prompt, content);
  },

  async generateQuotes(card) {
    const prompt = SYSTEM_PROMPTS.quote;
    const content = `段落内容：${card.content}`;
    const result = await this.callDeepSeek(prompt, content);
    // 简单的解析逻辑，假设 AI 返回 1. xxx 2. xxx 3. xxx
    return result.split('\n').filter(line => line.trim().match(/^\d\./)).map(line => line.replace(/^\d\.\s*/, '').trim());
  },

  async analyzeStructure(cards, projectTitle) {
    const prompt = SYSTEM_PROMPTS.complete;
    const structure = cards.map((c, i) => `${i + 1}. [${c.typeLabel}] ${c.title}`).join('\n');
    const content = `演讲标题：${projectTitle}\n当前结构：\n${structure}`;
    return this.callDeepSeek(prompt, content);
  }
};

module.exports = AiService;

