const SYSTEM_PROMPTS = {
  fill: '你是一位资深的演讲教练。请根据用户提供的演讲段落标题和简要大纲，将其填充为一段完整、流畅、具有吸引力的演讲稿。要求：口语化、直接、有力，适合在职场或头马（Toastmasters）场合演讲。',
  oral: '请将以下演讲段落修改得更加口语化。去掉书面语，使用短句，增加语气助词，使其听起来像是在自然对话，而不是在念稿子。',
  vivid: '请为以下演讲段落增加画面感。使用比喻、细节描述或感官词汇（听觉、视觉、触觉），让观众能够身临其境。',
  brief: '请精简以下演讲段落。保留核心观点和金句，去掉冗余的修饰词，使其更加干练、有力。',
  quote: '请根据以下演讲内容，提取或创作 3 条具有穿透力的金句。金句应短小精悍，富有哲理或情感冲击力。',
  complete: '你是一位演讲结构专家。请分析当前的演讲积木序列，指出缺失的关键环节（如开场钩子、转折点、结尾回扣或CTA），并为缺失的环节提供具体的创作建议或直接生成草稿。'
};

const AiService = {
  async callDeepSeek(prompt, content, onTextCallback) {
    // 检查基础库版本（需要 3.7.1+）
    if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
      throw new Error('当前基础库版本过低，请使用 3.7.1 或以上版本以使用 AI 能力');
    }

    try {
      // 创建混元模型
      const model = wx.cloud.extend.AI.createModel("hunyuan-exp");
      
      // 使用 streamText 流式获取文本
      const res = await model.streamText({
        data: {
          model: "hunyuan-turbos-latest",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: content }
          ],
          temperature: 0.7
        }
      });

      // 遍历 textStream 收集完整的文本流
      let fullText = '';
      for await (let text of res.textStream) {
        fullText += text;
        if (onTextCallback && typeof onTextCallback === 'function') {
          onTextCallback(fullText);
        }
      }

      console.log("AI 生成完成，内容长度：", fullText.length);
      return fullText;
    } catch (err) {
      console.error('AI 调用失败：', err);
      
      // 401 错误特殊处理
      if (err.errMsg && err.errMsg.includes('401')) {
        throw new Error('AI 服务认证失败。请检查：\n1. 云开发控制台是否已开启 AI 服务\n2. 是否已配置混元模型权限\n3. 环境 ID 是否正确');
      }
      
      throw new Error(err.message || err.errMsg || 'AI 请求失败，请检查网络或配置');
    }
  },

  async refineCard(action, card, projectContext = '', onTextCallback) {
    const prompt = SYSTEM_PROMPTS[action];
    const content = `项目背景：${projectContext}\n当前积木标题：${card.title}\n当前积木内容：${card.content}`;
    return this.callDeepSeek(prompt, content, onTextCallback);
  },

  async generateQuotes(card) {
    const prompt = SYSTEM_PROMPTS.quote;
    const content = `段落内容：${card.content}`;
    const result = await this.callDeepSeek(prompt, content);
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
