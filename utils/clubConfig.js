/**
 * 俱乐部与公众号配置
 * officialAccountUsername：公众号「微信号」（如 IYJ2009），仅在同主体绑定且 enableNativeProfileJump=true 时用于原生跳转
 */
module.exports = {
  clubName: 'i演讲·厦门演讲俱乐部',
  brandName: '厦门演讲俱乐部',
  /** 公众号微信号；未绑定同主体时原生跳转会空白，默认关闭原生跳转 */
  officialAccountUsername: 'IYJ2009',
  /** 是否尝试 wx.openOfficialAccountProfile（需小程序与公众号已关联且同主体） */
  enableNativeProfileJump: true,
  /** 关注渠道指引（关注页展示 + 复制搜索） */
  followChannels: [
    { type: '公众号', keyword: 'i演讲', tip: '打开微信 → 顶部搜索 → 选择「公众号」→ 搜索并关注' },
    { type: '视频号', keyword: '厦门演讲俱乐部', tip: '打开微信 → 顶部搜索 → 选择「视频号」→ 搜索并关注' },
    { type: '备用', keyword: '厦门演讲俱乐部', tip: '也可直接搜索俱乐部全称找到我们' }
  ],
  searchKeywords: ['i演讲', '厦门演讲俱乐部', 'i演讲厦门'],
  followHint: '推荐优先搜索公众号「i演讲」或视频号「厦门演讲俱乐部」。复制关键词后，切换到微信搜索即可找到我们。',
  introArticleUrl: ''
};
