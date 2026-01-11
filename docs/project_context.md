# AI 演讲积木 (AI Speak) - 项目技术上下文文档

本文档旨在为开发人员和 AI 助手提供关于本小程序的完整技术上下文，涵盖业务逻辑、架构设计、数据结构及核心流程。

## 1. 项目概述

**AI 演讲积木** 是一个基于微信小程序的积木化演讲稿编辑器。它采用“积木式”创作理念，将演讲拆分为独立的模块（Card），结合腾讯混元 AI 模型，提供从内容填充、润色到全局结构诊断的全链路辅助。

- **核心价值**: 帮助用户结构化思考，降低演讲稿创作门槛，提升表达质量。
- **技术栈**: 微信小程序原生开发 + 微信云开发 (Cloud Functions/AI 能力) + 本地 Storage 存储。

## 2. 文件目录结构

```text
├── app.js                # 小程序入口，初始化云开发环境
├── app.json              # 全局配置
├── utils/
│   ├── ai.js             # AI 服务层：封装腾讯混元 AI 调用、流式响应处理
│   └── storage.js        # 数据层：封装本地存储 CRUD 操作
├── pages/
│   ├── history/          # [首页] 项目列表管理（新建/搜索/删除）
│   ├── index/            # [核心] 积木编辑器（增删改查、AI 润色、流式交互）
│   ├── mentor/           # [建议] AI 导师建议管理中心
│   └── preview/          # [预览] 全文拼接、时长分析、Markdown 导出
└── docs/                 # 项目文档
```

## 3. 核心数据结构

### 3.1 演讲项目 (Project)
存储在 `wx.getStorageSync('projects')` (列表摘要) 和 `wx.getStorageSync('project_{id}')` (完整详情)。

```javascript
{
  id: "1715421234567",       // 项目唯一 ID (Timestamp)
  title: "未命名演讲",        // 演讲标题
  type: "toastmasters_story",// 项目类型
  createdAt: 1715421234567,  // 创建时间
  updatedAt: 1715421234567,  // 更新时间
  
  // 以下字段仅在详情存储中包含，列表存储中包含统计摘要
  cards: [],                 // 积木数组 (见 3.2)
  mentorSuggestions: []      // 导师建议数组 (见 3.3)
}
```

### 3.2 演讲积木 (Card)
演讲稿的基本组成单元。

```javascript
{
  id: "1715421234567_1",     // 积木唯一 ID
  type: "opening",           // 环节类型 (opening/conflict/insight/...)
  typeLabel: "开场",         // 类型显示名
  title: "开场钩子",          // 环节标题
  intent: "吸引注意力...",     // 设计意图描述
  content: "大家好...",       // 演讲稿正文内容
  durationSec: 15,           // 预估时长 (秒)
  wordCount: 45,             // 字数统计
  isAi: false,               // 是否处于 AI 协作状态
  tempAiContent: null,       // AI 生成的临时预览内容 (流式显示用)
  quotes: [                  // 关联的金句列表
    { type: "ref", text: "...", source: "..." }
  ]
}
```

### 3.3 导师建议 (MentorSuggestion)
全局 AI 诊断生成的建议项。

```javascript
{
  id: 1715421234999,
  title: "增强情感张力",      // 建议标题
  text: "建议在冲突环节...",   // 详细指导内容
  status: "pending" | "completed" // 状态
}
```

## 4. 核心功能与逻辑

### 4.1 积木编辑系统 (`pages/index`)
- **动态类型**: 定义了 `CARD_TYPES` 常量，包含 9 种演讲环节（开场、冲突、洞见等），每种有不同的 Prompt 策略。
- **实时计算**: 监听输入，按 `150字/分钟` (2.5字/秒) 实时计算单卡片及全篇时长。
- **拖拽排序**: 手写 Touch 事件处理 (`touchstart/move/end`)，实现列表项的平滑拖拽重排。

### 4.2 AI 协作机制 (`utils/ai.js`)
- **底层模型**: 调用 `wx.cloud.extend.AI.createModel("hunyuan-exp")`。
- **流式响应**: 使用 `model.streamText` 配合 `for await` 循环，实现打字机效果。
- **四种润色模式**:
    1.  **fill (填充)**: 基于标题和意图，扩写成完整段落。
    2.  **oral (口语化)**: 短句化、增加语气词。
    3.  **vivid (画面感)**: 增加感官细节（视听触）。
    4.  **brief (精简)**: 删减冗余，保留核心。
- **交互逻辑**:
    - 用户点击 AI -> 选择模式 -> 显示 Loading。
    - AI 流式生成 -> 实时更新 `card.tempAiContent` -> 界面展示预览框。
    - 用户决策: **替换原文** (覆盖 content) 或 **插入后行** (新建 Card)。

### 4.3 全局导师阅卷
- **触发**: 用户点击“AI 建议”。
- **流程**:
    1.  前端将所有 Card 的 `type` 和 `title` 拼接成结构树。
    2.  调用 AI 分析结构完整性、节奏和逻辑。
    3.  **非阻塞体验**: 阅卷在后台进行，用户可继续编辑，完成后通过 Toast 和震动通知。
    4.  **建议解析**: 正则解析 AI 返回的文本，提取出结构化的建议列表。

### 4.4 本地存储策略 (`utils/storage.js`)
- **读写分离**: 
    - `getProjects()`: 仅读取轻量级的项目元数据列表，保证首页加载速度。
    - `getProject(id)`: 读取包含大文本内容的完整项目数据。
- **数据一致性**: 更新详情 (`saveProjectData`) 时，会自动同步更新元数据 (`saveProjectMeta`) 中的字数、时长等统计信息。

## 5. UI/UX 细节
- **视觉反馈**: 拖拽时的阴影与占位、AI 生成时的流式动画、长按震动反馈。
- **时长可视化**: 预览页 (`pages/preview`) 使用柱状图展示各环节时长分布，并用颜色（蓝/橙/红）警示时长是否合理。

## 6. 后续开发注意事项
1.  **AI Token 消耗**: 目前采用直连模式，需注意云开发资源配额。
2.  **Prompt 调优**: `SYSTEM_PROMPTS` 集中管理所有提示词，修改此处可全局影响 AI 表现。
3.  **基础库兼容**: 依赖 `wx.cloud.extend.AI`，需确保用户基础库版本 >= 3.7.1。
