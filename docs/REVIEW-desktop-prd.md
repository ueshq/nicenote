# NiceNote Desktop PRD — 架构评审与技术选型建议

> **评审角色**: CTO / 首席架构师
> **评审日期**: 2026-02-25
> **参考项目**: [MrRSS](../mrrss)（Wails 3 + Vue + Go）、[Folo](../Folo)（Electron + React Native + Expo）
> **关键变更**: 目标平台从「桌面三端」扩展为「全平台五端」(iOS / Android / HarmonyOS / macOS / Windows)，技术路线从 Wails 3 切换为 **React Native Bare Workflow**

---

## 一、核心结论

原 PRD 基于 Wails 3（Go + React WebView）设计桌面应用，但新增「鸿蒙支持」+「React Native Bare Workflow」两个约束后，整体架构需要**根本性重构**。Wails 3 无法运行在移动端和鸿蒙上，Go 后端在 RN 生态中缺乏集成路径。建议采用以下架构：

```
┌──────────────────────────────────────────────────────────────┐
│                     NiceNote 全平台架构                        │
│                                                              │
│   React Native Bare Workflow (统一 UI 层)                     │
│   ├── iOS          (react-native)                            │
│   ├── Android      (react-native)                            │
│   ├── HarmonyOS    (react-native-harmony / RNOH)             │
│   ├── macOS        (react-native-macos)                      │
│   └── Windows      (react-native-windows)                    │
│                                                              │
│   本地数据层                                                   │
│   ├── op-sqlite (iOS/Android/macOS) — 最快的 RN SQLite       │
│   ├── expo-sqlite (备选)                                     │
│   └── @react-native-oh-tpl/sqlite (HarmonyOS)               │
│                                                              │
│   共享业务逻辑 (TypeScript)                                    │
│   ├── @nicenote/shared    — Schema / 工具函数 / 类型          │
│   ├── @nicenote/editor    — Tiptap 编辑器 (仅桌面端复用)       │
│   ├── @nicenote/tokens    — 设计令牌                          │
│   └── @nicenote/store     — Zustand 状态管理 (新增)           │
└──────────────────────────────────────────────────────────────┘
```

---

## 二、PRD 问题逐项评审

### 2.1 技术选型（第 1.4 节）— 需要全面重写

| PRD 原方案                  | 问题                                             | 建议方案                                                           |
| --------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| Wails 3 (Go + WebView)      | 不支持 iOS/Android/鸿蒙；仍在 Alpha              | **React Native Bare Workflow**                                     |
| Go 后端                     | RN 生态无 Go 集成路径；双语言增加复杂度          | **纯 TypeScript**，Native Module 仅用于平台桥接                    |
| SQLite via Go (CGo/modernc) | 与 RN 不兼容                                     | **op-sqlite** (C++ JSI binding，零桥接开销)                        |
| Vite 7 构建                 | RN 使用 Metro bundler                            | **Metro** (RN 标准) + **Re.Pack** (可选 Webpack)                   |
| Tiptap v3 (ProseMirror)     | ProseMirror 依赖 DOM，无法直接在 RN 原生视图运行 | 移动端使用 **WebView 嵌入编辑器**；桌面端(macOS/Windows)可直接渲染 |

### 2.2 编辑器方案（第 2.2.2 节）— 最大技术风险

**核心矛盾**: Tiptap/ProseMirror 是基于 DOM 的编辑器，React Native 不提供 DOM 环境。

**方案对比**:

| 方案                             | 优点                                        | 缺点                                                             | 推荐场景                 |
| -------------------------------- | ------------------------------------------- | ---------------------------------------------------------------- | ------------------------ |
| **A: WebView 嵌入 Tiptap**       | 完整复用 `@nicenote/editor`；功能 100% 一致 | 性能损耗（WebView 内存 ~50MB）；与原生交互需桥接；输入法兼容问题 | **推荐：全平台统一方案** |
| B: 纯原生 Markdown 编辑器        | 原生性能；无 WebView 开销                   | 重新开发；无法复用现有编辑器；功能对齐成本极高                   | 极度性能敏感场景         |
| C: react-native-pell-rich-editor | 开箱即用                                    | 功能简陋；不支持 Markdown 双模式                                 | 简单富文本需求           |

**推荐方案 A 的实现方式**（参考 Folo 的 `web-app` 模式）：

```
packages/
  editor/                    # 现有 Tiptap 编辑器（不变）
  editor-bridge/             # 新增：RN ↔ WebView 桥接层
    src/
      EditorWebView.tsx      # React Native 组件，内嵌 WebView
      bridge.ts              # postMessage 双向通信协议
      editor-html.ts         # 编辑器 HTML 模板（内联打包）
```

通信协议设计：

```typescript
// RN → WebView (控制编辑器)
type EditorCommand =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'GET_CONTENT' }
  | { type: 'TOGGLE_SOURCE_MODE' }
  | { type: 'RUN_COMMAND'; payload: CommandId }

// WebView → RN (事件回调)
type EditorEvent =
  | { type: 'CONTENT_CHANGED'; payload: string }
  | { type: 'STATE_SNAPSHOT'; payload: NoteEditorStateSnapshot }
  | { type: 'READY' }
```

### 2.3 数据库方案（第 2.2.3 节）— 需适配 RN 生态

**PRD 原方案**: Go 操作 SQLite → 不适用

**推荐方案**: `op-sqlite` (JSI binding，同步调用，零桥接开销)

| 库                          | JSI | 同步 | 性能 | 鸿蒙支持  | 备注                     |
| --------------------------- | --- | ---- | ---- | --------- | ------------------------ |
| **op-sqlite**               | ✅  | ✅   | 最快 | ❓ 需验证 | Folo 级别项目的首选      |
| expo-sqlite                 | ✅  | ✅   | 快   | ❌        | 需要 Expo 模块系统       |
| react-native-quick-sqlite   | ✅  | ✅   | 快   | ❌        | 维护不活跃               |
| @react-native-oh-tpl/sqlite | —   | —    | —    | ✅        | 鸿蒙专用，需与主方案桥接 |

**鸿蒙 SQLite 策略**: 使用平台文件抽象层，iOS/Android/macOS/Windows 用 op-sqlite，鸿蒙用 `@react-native-oh-tpl/sqlite`，通过统一的 `DatabaseAdapter` 接口封装差异：

```typescript
// packages/database/src/adapter.ts
export interface DatabaseAdapter {
  execute(sql: string, params?: any[]): Promise<QueryResult>
  executeBatch(commands: SQLCommand[]): Promise<void>
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>
  close(): Promise<void>
}

// packages/database/src/adapters/op-sqlite.ts
export class OpSQLiteAdapter implements DatabaseAdapter { ... }

// packages/database/src/adapters/harmony-sqlite.ts
export class HarmonySQLiteAdapter implements DatabaseAdapter { ... }
```

### 2.4 FTS5 全文搜索（第 2.2.5 节）— 需验证可用性

**风险**: op-sqlite 默认编译的 SQLite 可能未启用 FTS5 扩展。

**缓解措施**:

1. op-sqlite 支持自定义编译 SQLite，添加 `-DSQLITE_ENABLE_FTS5` 编译标志
2. 备选方案：纯 JS 实现全文搜索（如 MiniSearch / FlexSearch），对万级笔记量足够
3. 鸿蒙端若 SQLite FTS5 不可用，降级为 LIKE '%keyword%' + 应用层排序

### 2.5 状态管理（第 4.4 节）— 建议对齐 Folo 模式

PRD 仅用了 Zustand，建议参考 Folo 的**三层状态架构**但做减法（NiceNote 复杂度远低于 Folo）：

| 层级        | 技术            | 职责                   | NiceNote 是否需要         |
| ----------- | --------------- | ---------------------- | ------------------------- |
| UI State    | Jotai           | 主题、侧边栏、模态框   | ❌ 过度设计，Zustand 足够 |
| Domain Data | Zustand + Immer | 笔记列表、文件夹、标签 | ✅ 核心                   |
| Server Data | TanStack Query  | API 缓存、离线同步     | ❌ 无网络功能，不需要     |

**推荐**: 仅用 **Zustand v5 + Immer**，保持简单：

```typescript
// packages/store/src/note-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface NoteStore {
  notes: NoteListItem[]
  selectedNoteId: string | null
  // ... actions
}

export const useNoteStore = create<NoteStore>()(
  immer((set, get) => ({
    // ...
  }))
)
```

### 2.6 多窗口（第 2.3.5 节）— 移动端不适用

多窗口是桌面端概念。在 RN 架构下：

- **macOS/Windows**: `react-native-macos` / `react-native-windows` 原生支持多窗口，但实现复杂度高
- **移动端**: 不支持传统多窗口（iPadOS Split View 需单独适配）

**建议**: v1.0 降级为 P3 或移除，改为分屏/标签页模式（移动端友好的替代方案）。

### 2.7 系统托盘（第 2.3.1 节）— 仅桌面端

系统托盘在 RN macOS/Windows 中可通过 Native Module 实现，但移动端无此概念。

**建议**: 保留为桌面端专属功能，通过平台条件编译隔离：

```typescript
// src/native/tray/index.ts        (空 stub)
// src/native/tray/index.macos.ts  (macOS 实现)
// src/native/tray/index.windows.ts (Windows 实现)
```

---

## 三、推荐技术栈（完整版）

### 3.1 核心框架

| 层级           | 技术                                      | 版本        | 说明                               |
| -------------- | ----------------------------------------- | ----------- | ---------------------------------- |
| **跨平台框架** | React Native (Bare Workflow)              | 0.79+       | 不使用 Expo managed workflow       |
| **桌面端**     | react-native-macos + react-native-windows | 社区维护    | 微软官方维护 windows 版            |
| **鸿蒙端**     | RNOH (react-native-harmony)               | 0.72/0.77   | Software Mansion + Huawei 联合维护 |
| **语言**       | TypeScript 5.9                            | strict mode | 与现有项目一致                     |
| **React**      | React 19                                  |             | 与现有项目一致                     |

### 3.2 数据层

| 技术                            | 用途                                            |
| ------------------------------- | ----------------------------------------------- |
| **op-sqlite**                   | SQLite JSI binding (iOS/Android/macOS/Windows)  |
| **Drizzle ORM**                 | 类型安全 SQL 查询构建器（参考 Folo）            |
| **@react-native-oh-tpl/sqlite** | 鸿蒙 SQLite (通过 adapter 封装)                 |
| **MMKV**                        | 轻量 KV 存储（用户偏好配置，替代 AsyncStorage） |

**为什么选 Drizzle 而非直接写 SQL**:

- Folo 使用 Drizzle + SQLite 的组合已经过大规模验证
- 类型安全，schema 变更有迁移支持
- 与现有 `apps/api` 的 Drizzle 经验可复用

### 3.3 UI 层

| 技术                             | 用途                | 说明                                     |
| -------------------------------- | ------------------- | ---------------------------------------- |
| **NativeWind v4**                | Tailwind CSS for RN | 参考 Folo 的移动端样式方案               |
| **React Native Reanimated**      | 动画                | 60fps 原生动画，鸿蒙已有 RNOH 移植       |
| **React Native Gesture Handler** | 手势                | 滑动删除、拖拽排序等，鸿蒙已有 RNOH 移植 |
| **@shopify/flash-list**          | 高性能列表          | 替代 FlatList，笔记列表虚拟滚动          |
| **react-native-bottom-sheet**    | 底部面板            | 移动端搜索/菜单交互                      |
| **react-native-webview**         | 编辑器容器          | 嵌入 Tiptap 编辑器                       |

### 3.4 导航

| 技术                               | 说明                   |
| ---------------------------------- | ---------------------- |
| **React Navigation v7**            | RN 标准导航方案        |
| **@react-navigation/drawer**       | 侧边栏导航（笔记列表） |
| **@react-navigation/native-stack** | 页面栈导航             |

### 3.5 存储与文件

| 技术                             | 用途                                 |
| -------------------------------- | ------------------------------------ |
| **react-native-mmkv**            | 用户偏好 (替代 PRD 中的 config.json) |
| **react-native-fs**              | 文件系统操作 (.md 导入/导出)         |
| **react-native-document-picker** | 系统文件选择器                       |
| **react-native-share**           | 系统分享                             |

### 3.6 开发工具

| 技术                                    | 用途                                   |
| --------------------------------------- | -------------------------------------- |
| **Metro**                               | RN 标准打包器                          |
| **Flipper** / **React Native Debugger** | 调试工具                               |
| **Reactotron**                          | 状态检查、网络监控                     |
| **Detox** / **Maestro**                 | E2E 测试                               |
| **Rock CLI** (Callstack)                | 统一构建命令 (实验性 run:harmony 支持) |

---

## 四、Monorepo 结构建议

```
nicenote/
├── apps/
│   ├── api/                          # 现有 Hono API（保留，Web 版用）
│   ├── web/                          # 现有 Web 前端（保留）
│   └── mobile/                       # 新增：React Native 应用
│       ├── ios/                      # iOS 原生工程
│       ├── android/                  # Android 原生工程
│       ├── harmony/                  # HarmonyOS 原生工程 (RNOH)
│       ├── macos/                    # macOS 原生工程 (react-native-macos)
│       ├── windows/                  # Windows 原生工程 (react-native-windows)
│       ├── src/
│       │   ├── app/                  # 应用入口 & 导航
│       │   ├── screens/             # 页面组件
│       │   │   ├── NoteListScreen.tsx
│       │   │   ├── NoteEditorScreen.tsx
│       │   │   ├── SearchScreen.tsx
│       │   │   ├── SettingsScreen.tsx
│       │   │   ├── FolderScreen.tsx
│       │   │   └── TrashScreen.tsx
│       │   ├── components/          # RN 专属组件
│       │   │   ├── NoteListItem.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   └── EditorWebView.tsx
│       │   ├── native/             # 平台特定 Native Module
│       │   │   ├── tray/           # 系统托盘 (桌面端)
│       │   │   ├── shortcuts/      # 全局快捷键 (桌面端)
│       │   │   └── backup/         # 自动备份
│       │   ├── hooks/              # RN 专属 hooks
│       │   └── lib/                # RN 专属工具
│       ├── index.js                 # RN 入口
│       ├── metro.config.js
│       ├── app.json
│       └── package.json
│
├── packages/
│   ├── shared/                      # 现有：Schema / 工具函数 / 类型（✅ 全复用）
│   ├── editor/                      # 现有：Tiptap 编辑器（✅ WebView 内复用）
│   ├── ui/                          # 现有：Radix UI 组件（❌ RN 不兼容，仅 Web 版用）
│   ├── tokens/                      # 现有：设计令牌（✅ 复用值，输出格式适配 NativeWind）
│   ├── database/                    # 新增：跨平台数据库层
│   │   ├── src/
│   │   │   ├── schema.ts           # Drizzle schema（复用现有 notes 表设计）
│   │   │   ├── migrations/         # 数据库迁移
│   │   │   ├── adapter.ts          # DatabaseAdapter 接口
│   │   │   ├── adapters/
│   │   │   │   ├── op-sqlite.ts    # iOS/Android/macOS/Windows
│   │   │   │   └── harmony.ts      # 鸿蒙专用
│   │   │   └── services/
│   │   │       ├── note-service.ts  # 笔记 CRUD
│   │   │       ├── folder-service.ts
│   │   │       ├── tag-service.ts
│   │   │       ├── search-service.ts
│   │   │       └── backup-service.ts
│   │   └── package.json
│   ├── store/                       # 新增：Zustand 状态管理（跨平台共享）
│   │   ├── src/
│   │   │   ├── note-store.ts
│   │   │   ├── folder-store.ts
│   │   │   ├── tag-store.ts
│   │   │   ├── ui-store.ts         # 主题、侧边栏等 UI 状态
│   │   │   └── index.ts
│   │   └── package.json
│   └── editor-bridge/               # 新增：RN ↔ Tiptap WebView 桥接
│       ├── src/
│       │   ├── EditorWebView.tsx    # RN 组件
│       │   ├── bridge-protocol.ts   # 消息协议
│       │   ├── editor-html.ts       # 编辑器 HTML 模板
│       │   └── useEditorBridge.ts   # Hook
│       └── package.json
│
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## 五、共享包复用评估（修订版）

| 现有包             | Web 版 | RN 移动端  | RN 桌面端  | 复用方式                                                 |
| ------------------ | ------ | ---------- | ---------- | -------------------------------------------------------- |
| `@nicenote/shared` | ✅     | ✅         | ✅         | **100% 复用** — 纯 TS，无 DOM 依赖                       |
| `@nicenote/editor` | ✅     | ⚠️ WebView | ⚠️ WebView | **WebView 内复用** — 需新增 bridge 层                    |
| `@nicenote/ui`     | ✅     | ❌         | ❌         | **不复用** — Radix UI 依赖 DOM，RN 需用原生组件          |
| `@nicenote/tokens` | ✅     | ✅ 值复用  | ✅ 值复用  | **部分复用** — 颜色/间距/字体值复用，输出适配 NativeWind |

### 新增包

| 新包                      | 用途            | 说明                                            |
| ------------------------- | --------------- | ----------------------------------------------- |
| `@nicenote/database`      | 跨平台数据库层  | Drizzle schema + adapter 模式                   |
| `@nicenote/store`         | 跨平台状态管理  | Zustand + Immer，Web 和 RN 共用                 |
| `@nicenote/editor-bridge` | 编辑器桥接      | RN WebView ↔ Tiptap 通信                        |
| `@nicenote/ui-native`     | RN 原生 UI 组件 | 基于 NativeWind，对标 `@nicenote/ui` 的 RN 版本 |

---

## 六、参考项目对比与借鉴

### 6.1 从 MrRSS 借鉴

| 模式                | MrRSS 实现                     | NiceNote 借鉴                                                  |
| ------------------- | ------------------------------ | -------------------------------------------------------------- |
| **设置系统**        | schema-driven 代码生成         | ✅ 采用：一个 JSON 定义设置项，自动生成 TS 类型 + 数据库默认值 |
| **SQLite 管理**     | WAL 模式 + 连接池 + 预编译语句 | ✅ 采用：op-sqlite 同样支持 WAL 模式和预编译                   |
| **HTTP-First 通信** | Go HTTP API + 前端 fetch       | ❌ 不采用：RN 直接调用本地数据库，无需 HTTP 层                 |
| **国际化**          | Vue-i18n (en/zh)               | ✅ 采用：react-i18next，同样支持 en/zh                         |
| **可移植模式**      | portable.txt 切换数据路径      | ✅ 采用：RN 用平台标准路径，但支持导出/导入数据库文件          |

### 6.2 从 Folo 借鉴

| 模式                 | Folo 实现                                 | NiceNote 借鉴                                        |
| -------------------- | ----------------------------------------- | ---------------------------------------------------- |
| **Drizzle + SQLite** | sqlocal (Web), expo-sqlite (Mobile)       | ✅ 采用：op-sqlite (Mobile/Desktop) + adapter 模式   |
| **迁移系统**         | 42 个 Drizzle migration                   | ✅ 采用：从 v1 起建立迁移纪律                        |
| **WebView 编辑器**   | mobile `web-app/` 目录内嵌 HTML           | ✅ 采用：editor-bridge 包封装 WebView + Tiptap       |
| **三层状态**         | Jotai + Zustand + TanStack Query          | ⚠️ 简化：仅 Zustand（无网络层，不需要 Query）        |
| **平台条件代码**     | `.ios.ts` / `.android.ts` + `IN_ELECTRON` | ✅ 采用：`Platform.select()` + `.harmony.ts` 扩展名  |
| **Monorepo 共享包**  | `packages/internal/` 多包                 | ✅ 采用：相同模式，但包粒度更粗（NiceNote 复杂度低） |
| **NativeWind**       | v4 for React Native                       | ✅ 采用：统一样式方案                                |
| **FlashList**        | @shopify/flash-list                       | ✅ 采用：笔记列表高性能渲染                          |

---

## 七、鸿蒙适配专项方案

### 7.1 现状评估

- **RNOH 成熟度**: 基于 RN 0.72 / 0.77 的 New Architecture (Fabric + TurboModules)
- **已移植库**: 70+ / 300+（包括 reanimated、gesture-handler 等核心库）
- **生产验证**: 小红书、携程、YY 等已上线
- **工具链**: DevEco Studio + Rock CLI (实验性)

### 7.2 核心依赖鸿蒙兼容性

| 依赖                         | 鸿蒙状态  | 替代方案                                    |
| ---------------------------- | --------- | ------------------------------------------- |
| op-sqlite                    | ❓ 未验证 | 使用 @react-native-oh-tpl/sqlite 或自行编译 |
| react-native-reanimated      | ✅ 已移植 | —                                           |
| react-native-gesture-handler | ✅ 已移植 | —                                           |
| react-native-webview         | ⚠️ 需验证 | 鸿蒙 ArkWeb 组件包装                        |
| react-native-mmkv            | ❓ 未验证 | @react-native-oh-tpl/async-storage          |
| react-native-fs              | ❓ 未验证 | 鸿蒙 fileio 模块包装                        |
| @shopify/flash-list          | ❓ 未验证 | 降级为 FlatList                             |
| react-navigation             | ✅ 纯 JS  | —                                           |
| zustand                      | ✅ 纯 JS  | —                                           |
| zod                          | ✅ 纯 JS  | —                                           |

### 7.3 鸿蒙适配策略

**原则**: 鸿蒙作为「增量平台」，不影响主线开发节奏。

```
阶段 1 (v0.5): iOS + Android 核心功能完成
阶段 2 (v0.8): macOS + Windows 桌面端
阶段 3 (v1.0): 鸿蒙适配 + 全平台发布
```

**适配手段**:

1. **平台文件**: `*.harmony.ts` 处理平台差异
2. **Adapter 模式**: 数据库、文件系统等通过接口抽象
3. **条件编译**: Metro 配置 `resolver.platforms: ['harmony']`
4. **降级策略**: 鸿蒙不支持的功能提供 fallback 或跳过

---

## 八、PRD 功能优先级调整建议

原 PRD 的功能优先级基于桌面端设计，转为全平台 RN 后需要调整：

### 8.1 重新排列的 P0 (v0.5 Alpha)

| 功能                      | 调整       | 原因                            |
| ------------------------- | ---------- | ------------------------------- |
| 笔记 CRUD                 | ✅ 保持 P0 | 核心功能                        |
| Markdown 编辑器 (WebView) | ✅ 保持 P0 | 通过 editor-bridge 实现         |
| 本地 SQLite 存储          | ✅ 保持 P0 | 改用 op-sqlite + Drizzle        |
| 笔记列表                  | ✅ 保持 P0 | FlashList 实现                  |
| 搜索                      | ⬇️ 降为 P1 | FTS5 在 RN SQLite 中需额外验证  |
| 深色/浅色主题             | ✅ 保持 P0 | NativeWind + `useColorScheme()` |

### 8.2 重新排列的 P1 (v1.0)

| 功能                    | 调整              | 原因                              |
| ----------------------- | ----------------- | --------------------------------- |
| 文件夹/标签             | ✅ 保持 P1        |                                   |
| 搜索（FTS5 或 JS 全文） | ⬆️ 从 P0 调整时间 | 先验证技术可行性                  |
| 快捷键体系              | ✅ 保持 P1        | 仅桌面端，移动端用手势替代        |
| .md 导入/导出           | ✅ 保持 P1        | react-native-fs + document-picker |
| 系统托盘                | ✅ 保持 P1        | 仅桌面端                          |
| 多窗口                  | ⬇️ 降为 P3        | RN 多窗口实现复杂                 |

### 8.3 新增移动端专属功能

| 功能                       | 优先级 | 说明                                        |
| -------------------------- | ------ | ------------------------------------------- |
| 手势操作（滑动删除/归档）  | P1     | react-native-gesture-handler                |
| 分享扩展 (Share Extension) | P2     | 从其他 App 分享文本到 NiceNote              |
| Widget（小组件）           | P2     | iOS Widget / Android Widget / 鸿蒙卡片      |
| 生物识别锁                 | P2     | 应用锁，保护隐私                            |
| 触觉反馈                   | P2     | expo-haptics / react-native-haptic-feedback |

---

## 九、构建与发布方案

### 9.1 构建矩阵

| 平台      | 工具链                         | 产物                       |
| --------- | ------------------------------ | -------------------------- |
| iOS       | Xcode + Fastlane               | .ipa → App Store           |
| Android   | Gradle + Fastlane              | .aab → Google Play, .apk   |
| HarmonyOS | DevEco Studio + hvigor         | .hap → AppGallery          |
| macOS     | Xcode (react-native-macos)     | .app → DMG / Mac App Store |
| Windows   | MSBuild (react-native-windows) | .msix → Microsoft Store    |

### 9.2 CI/CD

```yaml
# GitHub Actions 矩阵
strategy:
  matrix:
    platform: [ios, android, macos, windows]
    # 鸿蒙需单独 runner（DevEco Studio 环境）

steps:
  - pnpm install
  - pnpm build:packages # 构建共享包
  - pnpm --filter mobile build:${platform}
```

### 9.3 版本计划（修订）

| 版本   | 里程碑       | 平台              | 功能范围                         |
| ------ | ------------ | ----------------- | -------------------------------- |
| v0.1.0 | Prototype    | iOS               | CRUD + 编辑器 (WebView) + SQLite |
| v0.3.0 | Alpha        | iOS + Android     | 主题 + 列表优化 + 自动保存       |
| v0.5.0 | Beta         | iOS + Android     | 搜索 + 文件夹/标签 + 导入导出    |
| v0.8.0 | Desktop Beta | + macOS + Windows | 桌面适配 + 系统托盘 + 快捷键     |
| v1.0.0 | Release      | 全平台            | + 鸿蒙 + 打磨 + 全平台发布       |
| v1.1.0 | Enhancement  | 全平台            | 备份 + 国际化 + Widget           |

---

## 十、风险矩阵（修订）

| 风险                              | 概率 | 影响 | 缓解措施                                                     |
| --------------------------------- | ---- | ---- | ------------------------------------------------------------ |
| **WebView 编辑器性能**            | 中   | 高   | Profiling + 预加载 + 内存控制；低端机降级为纯文本模式        |
| **鸿蒙 RNOH 版本滞后**            | 高   | 中   | 鸿蒙作为最后接入平台；核心功能不依赖鸿蒙特有 API             |
| **op-sqlite 鸿蒙不兼容**          | 中   | 高   | Adapter 模式隔离；鸿蒙用专用 SQLite 库                       |
| **react-native-macos 维护不活跃** | 中   | 中   | 备选方案：macOS Catalyst（通过 iOS 项目直接生成 macOS 应用） |
| **五端 UI 一致性**                | 高   | 中   | Design Token 统一；NativeWind 跨平台样式；平台差异白名单管理 |
| **RN 版本碎片化**                 | 中   | 中   | 锁定 RN 0.79，鸿蒙用 RNOH 对应版本；避免依赖最新 API         |
| **包体积膨胀**                    | 中   | 低   | WebView 编辑器按需加载；Code splitting；Metro tree shaking   |

---

## 十一、开放问题（修订）

| #   | 问题                                                                     | 建议方向                                                                       |
| --- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1   | **RN 版本选择**: 0.79 (New Architecture 默认) vs 0.77 (RNOH 最高支持)    | 主线用 0.79，鸿蒙分支锁 0.77，通过共享包 + 平台条件抹平差异                    |
| 2   | **编辑器 WebView 输入法兼容**: 中文输入法在 WebView 中可能有组合输入问题 | 需在目标设备上充分测试；备选：移动端轻量编辑模式（纯 Markdown 文本框）         |
| 3   | **macOS 方案**: react-native-macos vs Mac Catalyst vs Electron           | 建议先尝试 react-native-macos（代码复用率最高），不可行再 fallback 到 Catalyst |
| 4   | **是否保留 Wails 3 桌面端**: 作为独立桌面入口与 RN 并行维护？            | ❌ 不建议。维护两套架构成本太高，统一用 RN 跨平台                              |
| 5   | **测试策略**: 五端如何保证质量？                                         | Maestro E2E 跨平台测试 + 平台级 snapshot 测试 + 共享包 Vitest 单测             |

---

## 十二、总结

### 必须做的变更

1. **放弃 Wails 3**，全面转向 React Native Bare Workflow
2. **新增 `@nicenote/database` 包**，基于 op-sqlite + Drizzle ORM + adapter 模式
3. **新增 `@nicenote/editor-bridge` 包**，WebView 内嵌 Tiptap 编辑器
4. **新增 `@nicenote/store` 包**，Zustand + Immer 跨平台状态管理
5. **新增 `@nicenote/ui-native` 包**，NativeWind 原生组件库（替代 Radix UI）
6. **适配 `@nicenote/tokens`**，输出 NativeWind 兼容格式

### 可以完整保留的

1. **`@nicenote/shared`** — 100% 复用，零改动
2. **`@nicenote/editor`** — WebView 内 100% 复用
3. **数据库 Schema 设计** — notes/folders/tags 表结构完全可用
4. **所有业务逻辑** — sanitize / summary / validation / debounce 全部复用

### 从参考项目学到的

| 来源          | 借鉴点                                                                                                           |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| **MrRSS**     | Schema-driven 设置系统、WAL 模式 SQLite、可移植数据目录                                                          |
| **Folo**      | Drizzle + SQLite adapter 模式、WebView 编辑器方案、NativeWind 样式、FlashList、Monorepo 共享包结构、平台条件编译 |
| **RNOH 社区** | Adapter 隔离鸿蒙差异、降级策略、Rock CLI 实验性工具                                                              |
