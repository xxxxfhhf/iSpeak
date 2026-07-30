/**
 * 从路径手册 PDF 提取纯文本，供课程内容解析使用
 */
const fs = require('fs');
const path = require('path');

async function extractPdf(filePath) {
  const pdfParse = require('pdf-parse');
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function main() {
  const base = path.join(__dirname, '..', '路径手册');
  const files = [
    '厦门演讲俱乐部L1晋级手册-A5V4.pdf',
    'L2演讲晋级手册_A5V4.pdf',
    'L3演讲晋级手册_A5-2（20251228）.pdf'
  ];
  const outDir = path.join(__dirname, '..', 'scripts', 'pdf-text');
  fs.mkdirSync(outDir, { recursive: true });

  for (const name of files) {
    const fp = path.join(base, name);
    const text = await extractPdf(fp);
    const outName = name.replace(/\.pdf$/i, '.txt');
    fs.writeFileSync(path.join(outDir, outName), text, 'utf8');
    console.log('OK', outName, 'chars:', text.length);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
