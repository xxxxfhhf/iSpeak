/**
 * 课程内容排版解析 — 将纯文本拆分为带类型的块，便于 WXML 分色分段展示
 */

/** 判断单行文本的类型 */
function getLineType(line) {
  if (/^【范例】/.test(line)) return 'example-start';
  if (/^【[^】]+】/.test(line)) return 'label';
  if (/^第.+件事/.test(line)) return 'subheading';
  if (/^[一二三四五六七八九十百千]+、/.test(line)) return 'chapter';
  if (/^\d+[\.、．]/.test(line)) return 'list';
  if (/^[•●·▪\uF06C]/.test(line)) return 'bullet';
  return 'text';
}

/** 拆分「【标题】正文」同行混排 */
function splitLabelLine(trimmed) {
  const match = trimmed.match(/^(【[^】]+】)([\s\S]*)$/);
  if (!match) return [{ type: 'label', text: trimmed }];
  const title = match[1];
  const body = (match[2] || '').trim();
  if (!body) return [{ type: 'label', text: title }];
  return [{ type: 'label', text: title }, { type: 'paragraph', text: body }];
}

/**
 * 解析课程正文为块数组
 * @returns {Array<{type: string, text: string}>}
 */
function parseCourseContent(text) {
  const blocks = [];
  const lines = (text || '').split('\n');
  let paraBuf = [];
  let exampleBuf = [];
  let inExample = false;

  /** 刷入普通段落 */
  const flushPara = () => {
    if (paraBuf.length) {
      blocks.push({ type: 'paragraph', text: paraBuf.join('') });
      paraBuf = [];
    }
  };

  /** 刷入范例区块 */
  const flushExample = () => {
    if (exampleBuf.length) {
      blocks.push({ type: 'example', text: exampleBuf.join('\n') });
      exampleBuf = [];
    }
    inExample = false;
  };

  for (let line of lines) {
    line = line.replace(/\r/g, '');
    const trimmed = line.trim();

    if (!trimmed) {
      if (inExample) flushExample();
      else flushPara();
      continue;
    }

    const lineType = getLineType(trimmed);

    // 范例区块开始
    if (lineType === 'example-start') {
      flushPara();
      flushExample();
      inExample = true;
      blocks.push({ type: 'example-title', text: '范例' });
      const rest = trimmed.replace(/^【范例】\s*/, '');
      if (rest) exampleBuf.push(rest);
      continue;
    }

    // 范例内连续行
    if (inExample) {
      if (lineType === 'chapter' || lineType === 'label') {
        flushExample();
      } else {
        exampleBuf.push(trimmed);
        continue;
      }
    }

    flushPara();

    if (lineType === 'label') {
      splitLabelLine(trimmed).forEach(part => blocks.push(part));
    } else if (lineType === 'chapter') {
      blocks.push({ type: 'chapter', text: trimmed });
    } else if (lineType === 'subheading') {
      blocks.push({ type: 'subheading', text: trimmed });
    } else if (lineType === 'list') {
      blocks.push({ type: 'list-item', text: trimmed });
    } else if (lineType === 'bullet') {
      blocks.push({ type: 'bullet', text: trimmed });
    } else {
      paraBuf.push(trimmed);
    }
  }

  if (inExample) flushExample();
  else flushPara();

  return blocks;
}

/** 修正 PDF 提取后 URL 中的顿号分隔 */
function normalizeUrl(raw) {
  let url = (raw || '').replace(/、/g, '.').replace(/，/g, '.');
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  return url;
}

/** 将段落文本拆分为可点击的链接/图片引用片段 */
function parseInlineSegments(text, imageMap) {
  if (!text) return [{ type: 'text', text: '' }];
  const map = imageMap || {};
  const pattern = /https?:\/\/[^\s\u4e00-\u9fff]+(?:[、./][^\s\u4e00-\u9fff]+)*|图[一二三四五六七八九十0-9]+/g;
  const segments = [];
  let last = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      segments.push({ type: 'text', text: text.slice(last, match.index) });
    }
    const token = match[0];
    if (/^https?:\/\//i.test(token)) {
      const url = normalizeUrl(token);
      segments.push({ type: 'link', text: url, url });
    } else {
      const img = map[token];
      segments.push({
        type: 'image',
        text: token,
        label: img ? img.caption : token,
        path: img ? img.path : ''
      });
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    segments.push({ type: 'text', text: text.slice(last) });
  }

  return segments.length ? segments : [{ type: 'text', text }];
}

/** 为文本块附加 segments（含链接与图引用） */
function enrichBlocksWithInline(blocks, imageMap) {
  const inlineTypes = ['paragraph', 'list-item', 'bullet', 'example', 'label', 'chapter'];
  return (blocks || []).map(block => {
    if (inlineTypes.includes(block.type) && block.text) {
      const segments = parseInlineSegments(block.text, imageMap);
      if (segments.some(s => s.type !== 'text')) {
        return { ...block, segments };
      }
    }
    return block;
  });
}

/**
 * 为 WXML 绑定补充静态 class 名（小程序不支持 block-{{type}} 动态样式名）
 */
function enrichBlocks(blocks, prefix) {
  const classMap = {
    paragraph: 'block-paragraph',
    label: 'block-label',
    chapter: 'block-chapter',
    subheading: 'block-subheading',
    'list-item': 'block-list-item',
    bullet: 'block-bullet',
    example: 'block-example',
    'example-title': 'block-example-title'
  };
  const key = prefix || 'blk';
  return (blocks || []).map((item, index) => ({
    ...item,
    id: key + '_' + index,
    cls: classMap[item.type] || 'block-paragraph'
  }));
}
module.exports = { parseCourseContent, enrichBlocks, parseInlineSegments, enrichBlocksWithInline, normalizeUrl };
