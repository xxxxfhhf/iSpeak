/**
 * 议程表导出 Excel（SpreadsheetML .xls，小程序可直接写文件并 openDocument）
 */
const { CLUB_HEADER, TIME_RULES } = require('./agendaBlocks.js');
const { calculateTimeRanges } = require('./agendaCalculator.js');

function escXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cell(row, col, value, type = 'String') {
  const ref = `${String.fromCharCode(65 + col)}${row}`;
  if (type === 'Number') {
    return `<Cell ss:Index="${col + 1}" ss:StyleID="sCell"><Data ss:Type="Number">${value}</Data></Cell>`;
  }
  return `<Cell ss:Index="${col + 1}" ss:StyleID="sCell"><Data ss:Type="String">${escXml(value)}</Data></Cell>`;
}

function rowXml(cells, rowNum) {
  return `<Row ss:Index="${rowNum}">${cells.join('')}</Row>`;
}

/** 生成 SpreadsheetML 字符串 */
function buildAgendaSpreadsheet(agenda) {
  const calc = calculateTimeRanges(agenda);
  const rows = [];
  let r = 1;

  rows.push(rowXml([cell(r, 0, `会议主题：${agenda.theme || ''}    主题词：${agenda.themeWords || ''}`)], r++));
  rows.push(rowXml([
    cell(r, 0, '会议时间'),
    cell(r, 1, agenda.meetingDate || ''),
    cell(r, 4, '会议地点'),
    cell(r, 5, agenda.location || '')
  ], r++));
  rows.push(rowXml([cell(r, 0, `${CLUB_HEADER.clubName}第${agenda.meetingNo || ''}次会议`)], r++));
  rows.push(rowXml([cell(r, 0, CLUB_HEADER.intro)], r++));
  rows.push(rowXml([cell(r, 0, '时间'), cell(r, 1, '流程'), cell(r, 3, '角色'), cell(r, 4, '姓名'), cell(r, 5, '时间mins')], r++));
  rows.push(rowXml([cell(r, 3, '角色'), cell(r, 4, '姓名')], r++));

  (calc.blocks || []).forEach(b => {
    if (!b.enabled) return;
    if (b.type && b.type.endsWith('_section')) {
      rows.push(rowXml([cell(r, 1, b.label)], r++));
      return;
    }
    const flow = b.title ? `${b.label}《${b.title}》${b.pathCode ? ' ' + b.pathCode : ''}` : b.label;
    rows.push(rowXml([
      cell(r, 0, b.timeRange || ''),
      cell(r, 1, flow),
      cell(r, 3, b.role || ''),
      cell(r, 4, b.name || ''),
      cell(r, 5, b.durationText || (b.duration ? `${b.duration}'` : ''))
    ], r++));
  });

  if ((agenda.officers || []).length) {
    rows.push(rowXml([cell(r, 6, '俱乐部官员')], r++));
    rows.push(rowXml([cell(r, 6, '职位'), cell(r, 7, '姓名'), cell(r, 8, '电话')], r++));
    (agenda.officers || []).forEach(o => {
      rows.push(rowXml([cell(r, 6, o.title), cell(r, 7, o.name), cell(r, 8, o.phone)], r++));
    });
  }

  rows.push(rowXml([cell(r, 5, TIME_RULES)], r++));

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="sCell"><Font ss:FontName="宋体" ss:Size="10"/></Style>
</Styles>
<Worksheet ss:Name="会议流程">
<Table>
${rows.join('\n')}
</Table>
</Worksheet>
</Workbook>`;
}

/** 导出并打开 Excel 文件 */
function exportAgendaToExcel(agenda) {
  return new Promise((resolve, reject) => {
    const xml = buildAgendaSpreadsheet(agenda);
    const fileName = `议程_${agenda.meetingNo || 'draft'}_${Date.now()}.xls`;
    const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
    const fs = wx.getFileSystemManager();
    fs.writeFile({
      filePath,
      data: xml,
      encoding: 'utf8',
      success: () => {
        wx.openDocument({
          filePath,
          fileType: 'xls',
          showMenu: true,
          success: () => resolve(filePath),
          fail: err => {
            wx.showModal({
              title: '文件已保存',
              content: `已保存至：${fileName}，可在文件管理中用 Excel 打开`,
              showCancel: false
            });
            resolve(filePath);
          }
        });
      },
      fail: reject
    });
  });
}

module.exports = {
  buildAgendaSpreadsheet,
  exportAgendaToExcel
};
