/**
 * 议程时间轴计算 — 根据开始时间与各环节时长推算时间段
 */

function parseTime(str) {
  if (!str || typeof str !== 'string') return null;
  const m = str.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function formatTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatRange(startMins, duration) {
  if (duration <= 0) return formatTime(startMins);
  const end = startMins + duration;
  return `${formatTime(startMins)}-${formatTime(end)}`;
}

/**
 * 为 enabled 的积木计算 timeRange
 * @param {object} agenda { receptionStart, meetingStart, blocks }
 */
function calculateTimeRanges(agenda) {
  let cursor = parseTime(agenda.receptionStart || agenda.meetingStart || '19:20');
  if (cursor === null) cursor = 19 * 60 + 20;

  const blocks = (agenda.blocks || []).map(b => {
    if (!b.enabled) return { ...b, timeRange: '' };
    if (b.type && b.type.endsWith('_section')) {
      return { ...b, timeRange: '' };
    }
    const dur = Number(b.duration) || 0;
    const range = dur > 0 ? formatRange(cursor, dur) : formatTime(cursor);
    if (dur > 0) cursor += dur;
    return { ...b, timeRange: range };
  });

  return { ...agenda, blocks };
}

/** 扁平化为预览表格行 */
function toPreviewRows(agenda) {
  const calc = calculateTimeRanges(agenda);
  const rows = [];
  (calc.blocks || []).forEach(b => {
    if (!b.enabled) return;
    if (b.type && b.type.endsWith('_section')) {
      rows.push({ kind: 'section', text: b.label || BLOCK_TYPES_LABEL(b.type) });
      return;
    }
    rows.push({
      kind: 'row',
      time: b.timeRange || '',
      flow: b.title ? `${b.label}《${b.title}》` : b.label,
      pathCode: b.pathCode || '',
      role: b.role || '',
      name: b.name || '',
      duration: b.durationText || (b.duration ? `${b.duration}'` : b.durationText || '')
    });
  });
  return rows;
}

function BLOCK_TYPES_LABEL(type) {
  const map = {
    table_topics_section: '即兴演讲环节',
    prepared_section: '备稿演讲环节',
    workshop_section: '工作坊环节',
    eval_section: '点评环节',
    closing_section: '颁奖及闭会环节',
    role_intro_section: '角色亮相环节'
  };
  return map[type] || type;
}

module.exports = {
  parseTime,
  formatTime,
  formatRange,
  calculateTimeRanges,
  toPreviewRows
};
