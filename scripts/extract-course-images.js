/**
 * 从 PDF 手册导出课程配图到 assets/learning/
 * 用法：node scripts/extract-course-images.js
 * 依赖：pdfjs-dist（npm install pdfjs-dist）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PDF_DIR = path.join(ROOT, '路径手册');
const OUT_DIR = path.join(ROOT, 'assets', 'learning');

/** 需导出的课程与 PDF 源文件 */
const JOBS = [
  {
    courseId: 'L2X1-C2',
    pdf: 'L2演讲晋级手册_A5V4.pdf',
    // PDF 页码从 1 起，PPT 章节配图约在 30-36 页（按实际 PDF 调整）
    pages: [30, 31, 32, 33, 34, 35, 36, 37, 38, 40],
    names: ['fig1', 'fig2', 'fig3', 'fig4', 'fig5', 'fig6', 'fig7', 'fig8', 'fig9', 'fig11']
  },
  {
    courseId: 'L3X3-C1',
    pdf: 'L3演讲晋级手册_A5-2（20251228）.pdf',
    pages: [28],
    names: ['fig1']
  }
];

async function main() {
  let pdfjs;
  try {
    pdfjs = require('pdfjs-dist/legacy/build/pdf.js');
  } catch (e) {
    console.error('请先运行: npm install pdfjs-dist');
    process.exit(1);
  }

  for (const job of JOBS) {
    const pdfPath = path.join(PDF_DIR, job.pdf);
    if (!fs.existsSync(pdfPath)) {
      console.warn('跳过，PDF 不存在:', pdfPath);
      continue;
    }
    const outCourse = path.join(OUT_DIR, job.courseId);
    fs.mkdirSync(outCourse, { recursive: true });

    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjs.getDocument({ data, disableFontFace: true }).promise;

    for (let i = 0; i < job.pages.length; i++) {
      const pageNum = job.pages[i];
      const name = job.names[i] + '.png';
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvasFactory = new pdfjs.NodeCanvasFactory();
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
      await page.render({
        canvasContext: canvasAndContext.context,
        viewport,
        canvasFactory
      }).promise;
      const outPath = path.join(outCourse, name);
      fs.writeFileSync(outPath, canvasAndContext.canvas.toBuffer('image/png'));
      console.log('已导出', job.courseId, name);
    }
  }
  console.log('完成');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
