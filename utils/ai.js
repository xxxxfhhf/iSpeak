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

  complete: '你是一位资深的演讲导师。请分析当前演讲内容，并给出 3-5 条具有实操意义的精进建议。要求：\n1. 每个建议必须包含【标题】和【详细建议】。\n2. 涵盖结构完整性、情感起伏、节奏控制或金句质量。\n3. 输出格式严格按照：\n建议1：[标题]\n内容：[详细指导]\n建议2：[标题]\n内容：[详细指导]',

  recommend: `你是一位敏锐的演讲架构师。请根据用户提供的【演讲目标】、【听众对象】和【灵感碎片】，从以下结构中推荐 1-2 个最合适的模版。
可选模版 ID：
- scqa (SCQA 职场汇报)：适合方案汇报、解决问题。
- golden_circle (黄金圈法则)：适合愿景感召、产品发布。
- hero_journey (英雄之旅)：适合个人成长故事、励志分享。
- prep (PREP 观点表达)：适合即兴发言、清晰阐述。

要求：
1. 分析为什么推荐这个模版。
2. 简要说明如何将用户的碎片放入该结构中。
3. 输出 JSON 格式，不要包含 Markdown 标记：
{
  "recommendations": [
    {
      "templateId": "scqa",
      "reason": "你的内容涉及职场问题解决...",
      "mapping_advice": "将'预算不足'放在冲突环节..."
    }
  ]
}`,

  generate: `你是一位全能演讲撰稿人。请根据【选定模版结构】和【用户原始碎片】，创作一篇完整的演讲稿初稿。

【输入信息】
- 演讲目标：{{goal}}
- 听众：{{audience}}
- 模版结构：{{structure}}
- 原始碎片：{{fragments}}

【任务要求】
1. 严格按照模版结构的顺序生成内容。
2. 将用户的原始碎片自然地融入到各个环节中。
3. 如果某些环节缺乏素材，请根据目标和逻辑进行合理的 AI 扩写。
4. 保持口语化风格。
5. 输出 JSON 格式，数组中的每一项对应结构中的一个环节：
[
  { "index": 0, "content": "生成的第一段内容..." },
  { "index": 1, "content": "生成的第二段内容..." }
]
`,

  theme: `你是厦门演讲俱乐部的会议策划顾问，擅长为中文演讲例会设计有感染力的会议主题。

【任务】根据用户给出的场合与关键词，生成 6 条会议主题灵感。

【要求】
1. 主题简洁有力，适合作为例会主题横幅（8~20 字为宜）。
2. 风格多样：励志、成长、职场、生活、幽默、行动号召各有覆盖。
3. 贴合演讲俱乐部场景，避免广告与敏感内容。
4. 每条附一句 15 字内的简短说明（为何适合）。
5. 严格输出 JSON，不要 Markdown 代码块：
{"themes":[{"title":"主题名","reason":"简短说明"}]}`
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
    const result = await require('./speechAI')({action: 'generate', prompt, messages: [{role: 'user', content}]});
    if (onTextCallback) onTextCallback(result.text);
    return result.text;
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
【当前演讲内容】
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
    const content = `演讲标题：${projectTitle}\n当前演讲内容：\n${structure}`;
    return this.callDeepSeek(prompt, content, onTextCallback);
  },

  /**
   * 推荐模版
   */
  async recommendTemplate(goal, audience, fragments) {
    const prompt = SYSTEM_PROMPTS.recommend;
    const content = `【演讲目标】${goal}\n【听众对象】${audience}\n【灵感碎片】\n${fragments.join('\n')}`;
    
    // 非流式调用，直接等待 JSON 结果
    const result = await this.callDeepSeek(prompt, content);
    try {
      // 尝试清理可能存在的 Markdown 代码块标记
      const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('解析推荐结果失败', e);
      // 降级返回默认
      return { recommendations: [{ templateId: 'scqa', reason: 'AI 解析失败，推荐通用模版', mapping_advice: '' }] };
    }
  },

  /**
   * 生成全篇项目内容
   */
  async generateProject(template, goal, audience, fragments, onTextCallback) {
    let prompt = SYSTEM_PROMPTS.generate;
    
    // 构造结构描述字符串
    const structureDesc = template.structure.map((s, i) => 
      `第${i+1}段：[${s.title}] (${s.intent})`
    ).join('\n');

    // 简单的模版替换
    prompt = prompt.replace('{{goal}}', goal)
                   .replace('{{audience}}', audience)
                   .replace('{{structure}}', structureDesc)
                   .replace('{{fragments}}', fragments.join('\n'));

    const content = "请开始生成，直接输出 JSON 数据。";
    
    const result = await this.callDeepSeek(prompt, content, onTextCallback);
    try {
      const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('解析生成结果失败', e);
      return [];
    }
  },

  /**
   * 会议主题灵感（运营工具）— 调用混元 AI
   * @param {String} occasion 场合，如例会/工作坊
   * @param {String} keyword 关键词
   * @param {Function} onTextCallback 流式回调（可选）
   * @returns {Promise<Array<{title:string,reason:string}>>}
   */
  async generateThemeIdeas(occasion, keyword, onTextCallback) {
    const prompt = SYSTEM_PROMPTS.theme;
    const content = `【场合】${occasion || '俱乐部例会'}\n【关键词】${keyword || '成长、表达'}\n请直接输出 JSON。`;
    const result = await this.callDeepSeek(prompt, content, onTextCallback);
    try {
      const jsonStr = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      const list = (parsed.themes || []).filter(t => t && t.title);
      if (list.length) return list;
    } catch (e) {
      console.error('解析主题灵感失败', e);
    }
    // 降级：按行拆分非空文本
    return result.split('\n')
      .map(l => l.replace(/^[\d\.\-\*、]+\s*/, '').trim())
      .filter(l => l.length >= 4 && l.length <= 40)
      .slice(0, 6)
      .map(title => ({ title, reason: 'AI 生成' }));
  }
};

module.exports = AiService;
