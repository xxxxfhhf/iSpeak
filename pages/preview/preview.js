const Storage = require('../../utils/storage');

Page({
  data: {
    project: null,
    cards: [],
    totalDurationStr: '00:00',
    totalWordCount: 0
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      this.loadData(id);
    }
  },

  loadData(id) {
    const projectData = Storage.getProject(id);
    const projects = Storage.getProjects();
    const projectMeta = projects.find(p => p.id === id);

    if (projectData) {
      const cards = projectData.cards.map(card => {
        const wordCount = (card.content || '').length;
        // 简单分析：假设 20s 对应约 60-70 字 (200字/min)
        const idealWords = Math.floor((card.durationSec || 20) * 3.3);
        let durationStatus = 'normal';
        if (wordCount > 0) {
          if (wordCount < idealWords * 0.5) durationStatus = 'too-short';
          else if (wordCount > idealWords * 1.5) durationStatus = 'too-long';
        }

        // 图表高度
        const barHeight = Math.min(100, Math.max(10, (wordCount / idealWords) * 50));
        let barColor = '#007aff';
        if (durationStatus === 'too-short') barColor = '#ff9500';
        if (durationStatus === 'too-long') barColor = '#ff3b30';

        return {
          ...card,
          wordCount,
          durationStatus,
          barHeight,
          barColor
        };
      });

      const totalWordCount = cards.reduce((sum, c) => sum + c.wordCount, 0);
      const totalSec = cards.reduce((sum, c) => sum + (c.durationSec || 0), 0);
      const min = Math.floor(totalSec / 60);
      const sec = totalSec % 60;
      const totalDurationStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

      this.setData({
        project: projectMeta,
        cards,
        totalWordCount,
        totalDurationStr
      });
    }
  },

  onBack() {
    wx.navigateBack();
  },

  onCopy() {
    let md = `# ${this.data.project.title}\n\n`;
    md += `预估总时长：${this.data.totalDurationStr} | 总字数：${this.data.totalWordCount}\n\n`;
    md += `---\n\n`;

    this.data.cards.forEach((card, index) => {
      md += `## ${index + 1}. ${card.title}\n\n`;
      md += `${card.content || '(暂无内容)'}\n\n`;
      
      if (card.quotes && card.quotes.length > 0) {
        card.quotes.forEach(quote => {
          md += `> **${quote.text}**\n\n`;
        });
      }
      md += `\n`;
    });

    wx.setClipboardData({
      data: md,
      success: () => {
        wx.showToast({
          title: 'Markdown 已复制',
          icon: 'success'
        });
      }
    });
  }
});

