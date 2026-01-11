const SYSTEM_PROMPTS = {
  fill: `你是一位资深的演讲教练。你不仅擅长填充演讲内容，更深刻理解演讲不同环节的独特性。

【你的任务】
1. 如果【当前演讲内容】不为空：请根据标题和意图，将其填充为一段完整、有力的演讲稿。
2. 如果【当前演讲内容】为空：请根据【环节类型】和【环节意图】，给出 1 个该环节的经典演讲案例或万能模版。

【环节特定指导】
- [开场]：重点在于制造钩子（Hook），吸引注意。
- [背景/冲突]：重点在于情感张力和细节描述，建立共情。
- [洞见/金句]：重点在于逻辑收紧，输出有穿透力的观点。
- [结尾/号召]：重点在于呼应开头，并给出清晰的行动指引。

【约束】
- 字数：如果是提供模板，建议控制在 100-150 字之间（适合 40-60 秒演讲）。
- 严禁扩展：如果优化字数保持在原段落 ±20% 以内。
- 风格：口语化、直接。
- 禁止输出任何解释性废话。`,

  oral: `你是一位演讲改写专家，擅长将“文字稿”转化为“自然口语”。

【你的任务】
1. 如果【当前演讲内容】不为空：对其进行口语化改写。多用短句（15字以内），增加语气助词（呢、嘛、吧），加入口语停顿（——）。
2. 如果【当前演讲内容】为空：请根据【环节类型】和【环节意图】，给出 1 个最适合该环节的口语化开场或表达范例。

【环节特定指导】
- [开场]：像跟老朋友打招呼，消除距离感。
- [冲突]：语气急促，多用反问和感叹。
- [洞见]：语气真诚、缓慢，像在分享人生秘密。

【约束】
- 严禁改变原意。
- 字数：如果是提供模板，建议控制在 100-150 字之间（适合 40-60 秒演讲）。
- 严禁扩展：如果优化字数保持在原段落 ±20% 以内。
- 禁止输出解释性废话。`,

  vivid: `你是一位视觉化表达专家，擅长通过语言在听众脑中“画图”。

【你的任务】
1. 如果【当前演讲内容】不为空：增加感官细节（视/听/触觉）和接地气的比喻。
2. 如果【当前演讲内容】为空：请根据【环节类型】和【环节意图】，给出 1 个极具画面感的经典描述片段。

【环节特定指导】
- [背景/案例]：细化环境描述（灯光、汗水、声音）。
- [冲突]：强化动作细节和心理活动。

【约束】
- 聚焦当前段落。
- 字数：如果是提供模板，建议控制在 100-150 字之间（适合 40-60 秒演讲）。
- 严禁扩展：如果优化字数保持在原段落 ±20% 以内。
- 禁止输出解释性废话。`,

  brief: `你是一位极简主义演讲教练，信奉“少即是多”。

【你的任务】
1. 如果【当前演讲内容】不为空：删减冗余词汇，提炼金句，增强节奏感。
2. 如果【当前演讲内容】为空：请根据【环节类型】和【环节意图】，给出 1 个简短而有力的表达模版。

【约束】
- 字数要求：比原文缩减 10%-30%。
- 字数：如果是提供模板，建议控制在 100-150 字之间（适合 40-60 秒演讲）。
- 仅输出优化结果。`,

  quote: `你是一位资深的演讲金句专家。请根据提供的演讲内容，产出 3 条具有多样性的金句：
1. 其中 2 条必须是名人名言或经典语录（引用），且必须提供准确的出处。
2. 其中 1 条必须是基于当前内容原创的 AI 金句。

重要：请尽量避开极其常见的名言（如“世上无难事”），尝试挖掘更有深度、更契合演讲语境的冷门金句。每次请求应尝试给出不同的推荐。

输出格式要求（严格按此格式，每行一条，不要包含数字编号）：
[引用] "金句内容" —— 出处
[引用] "金句内容" —— 出处
[AI原创] "金句内容"`,

  complete: '你是一位资深的演讲导师。请分析当前的演讲积木序列，并给出 3-5 条具有实操意义的精进建议。要求：\n1. 每个建议必须包含【标题】和【详细建议】。\n2. 涵盖结构完整性、情感起伏、节奏控制或金句质量。\n3. 输出格式严格按照：\n建议1：[标题]\n内容：[详细指导]\n建议2：[标题]\n内容：[详细指导]'
};

const AiService = {
  /**
   * 调用腾讯混元 AI 模型进行文本生成（流式）
   * 这是 AI 服务的核心底层方法，负责与腾讯云 AI 服务通信
   * 
   * @param {String} prompt - 系统提示词，定义 AI 的角色和任务要求（如：演讲教练、口语化改写等）
   * @param {String} content - 用户输入的内容，需要 AI 处理的文本
   * @param {Function} onTextCallback - 流式文本回调函数，每次接收到新的文本片段时调用
   *                                     用于实现打字机式的实时显示效果
   * @returns {Promise<String>} 返回 AI 生成的完整文本内容
   */
  async callDeepSeek(prompt, content, onTextCallback) {
    // 检查小程序基础库版本，确保支持 AI 能力
    // wx.cloud.extend.AI 是微信小程序基础库 3.7.1+ 才提供的 API
    // 如果不存在，说明基础库版本过低，无法使用 AI 功能
    if (!wx.cloud || !wx.cloud.extend || !wx.cloud.extend.AI) {
      throw new Error('当前基础库版本过低，请使用 3.7.1 或以上版本以使用 AI 能力');
    }

    try {
    
      const model = wx.cloud.extend.AI.createModel("hunyuan-exp");
      
      // 调用流式文本生成 API
      // streamText 方法会以流式（SSE）方式返回 AI 生成的文本
      // 相比同步调用，流式调用可以实时显示生成过程，用户体验更好
      console.log("prompt", prompt);
      console.log("content", content);
      console.log("onTextCallback", onTextCallback);
      const res = await model.streamText({
        data: {
          // 指定使用的具体模型版本
          // "hunyuan-turbos-latest" 是腾讯混元最新版本的快速模型
          // 速度快、响应及时，适合实时交互场景
          model: "hunyuan-turbos-latest",
          // 消息数组，遵循 OpenAI 格式的对话结构
          messages: [
            // system 消息：定义 AI 的角色和行为准则
            // 这里的 prompt 通常是预定义的系统提示词（如：演讲教练、口语化改写等）
            { role: "system", content: prompt },
            // user 消息：用户的实际输入内容
            // 这里的 content 是需要 AI 处理的文本（如：卡片内容、项目背景等）
            { role: "user", content: content }
          ],
          
          // temperature 参数：控制 AI 生成的随机性和创造性
          // 取值范围：0.0 - 1.0
          // 0.7 是一个平衡值：
          //   - 较低值（如 0.3）：更保守、更可预测，适合需要准确性的场景
          //   - 较高值（如 0.9）：更创新、更多样化，但可能不够稳定
          //   0.7 在创造性和稳定性之间取得平衡，适合演讲内容生成
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

  /**
   * 优化/改写卡片内容
   * 根据不同的 action 类型（fill/oral/vivid/brief），使用对应的提示词对卡片内容进行 AI 优化
   * 
   * @param {String} action - 操作类型：'fill'(填充)、'oral'(口语化)、'vivid'(画面感)、'brief'(精简)
   * @param {Object} card - 卡片对象，包含 title（标题）和 content（内容）
   * @param {String} projectContext - 项目背景/演讲标题，用于提供上下文信息，默认为空字符串
   * @param {Function} onTextCallback - 流式文本回调函数，每次接收到新的文本片段时调用，用于实现打字机效果
   * @returns {Promise<String>} 返回 AI 生成的完整文本内容
   */
  async refineCard(action, card, projectContext = '', onTextCallback) {
    // 从 SYSTEM_PROMPTS 对象中获取对应 action 的系统提示词
    // 提示词定义了 AI 的角色和任务要求（如：演讲教练、口语化改写等）
    const prompt = SYSTEM_PROMPTS[action];
    
    // 组装用户输入内容，包含更详细的结构信息：
    // 1. 演讲总体背景
    // 2. 当前环节的类型名称（如：开场、冲突）
    // 3. 当前环节的设计意图（来自 CARD_TYPES 定义）
    // 4. 当前环节的标题
    // 5. 当前段落的实际内容
    const content = `【演讲标题/背景】${projectContext || '未命名演讲'}
【环节类型】${card.typeLabel}
【环节意图】${card.intent}
【当前环节标题】${card.title}
【当前演讲稿段落内容】
${card.content || '(内容为空，请给出该环节的案例或模版)'}`;
    
    // 调用底层 AI 服务
    return this.callDeepSeek(prompt, content, onTextCallback);
  },

  async generateQuotes(card) {
    const prompt = SYSTEM_PROMPTS.quote;
    const content = `段落内容：${card.content}`;
    const result = await this.callDeepSeek(prompt, content);
    
    // 解析金句格式
    const lines = result.split('\n').filter(l => l.trim().length > 0);
    return lines.map(line => {
      let type = 'ai';
      let text = line;
      let source = '';

      if (line.includes('[引用]')) {
        type = 'ref';
        // 尝试匹配 "内容" —— 出处
        const match = line.match(/\[引用\]\s*"(.*?)"\s*——\s*(.*)/);
        if (match) {
          text = match[1];
          source = match[2];
        }
      } else if (line.includes('[AI原创]')) {
        type = 'ai';
        const match = line.match(/\[AI原创\]\s*"(.*?)"/);
        if (match) {
          text = match[1];
        } else {
          text = line.replace('[AI原创]', '').replace(/"/g, '').trim();
        }
      }
      return { type, text, source };
    });
  },

  async analyzeStructure(cards, projectTitle, onTextCallback) {
    const prompt = SYSTEM_PROMPTS.complete;
    const structure = cards.map((c, i) => `${i + 1}. [${c.typeLabel}] ${c.title}`).join('\n');
    const content = `演讲标题：${projectTitle}\n当前结构：\n${structure}`;
    return this.callDeepSeek(prompt, content, onTextCallback);
  }
};

module.exports = AiService;
