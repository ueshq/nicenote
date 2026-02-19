# Nicenote 优化计划

---

## 一、高优先级

### 1.1 ⬜ 移除死代码与孤儿依赖

**问题：** `ConfirmDialog.tsx` 未被引用，其依赖 `@radix-ui/react-alert-dialog` 成为孤儿依赖。`useMenuNavigation` hook 已导出但无消费者。

**涉及文件：**

- `apps/web/src/components/ConfirmDialog.tsx`
- `apps/web/package.json`
- `packages/ui/src/index.ts`（若导出了 `useMenuNavigation`）

**操作：**

1. 删除 `apps/web/src/components/ConfirmDialog.tsx`
2. 从 `apps/web/package.json` 移除 `@radix-ui/react-alert-dialog`
3. 检查并移除 `useMenuNavigation` 的无效导出
4. 运行 `pnpm install` 更新 lockfile

---

### 1.2 ⬜ 修复速率限制器（per-isolate 问题）

**问题：** `apps/api/src/index.ts` 中的速率限制基于内存 `Map`，Cloudflare Workers 多 Isolate 并行时无法全局生效。

**涉及文件：**

- `apps/api/src/index.ts`（rate limiter 中间件）

**方案：**

- 短期：添加注释文档说明当前限制，并在响应头中添加 `X-RateLimit-*` 信息
- 中期：迁移到 Cloudflare KV 或 Durable Objects 实现全局速率限制

---

### 1.3 ⬜ 修复分页游标碰撞

**问题：** `note-service.ts` 分页仅用 `updatedAt` 作游标，两条笔记 `updatedAt` 相同时可能跳过记录。

**涉及文件：**

- `apps/api/src/services/note-service.ts`（`list` 方法）
- `packages/shared/src/schemas.ts`（`noteListQuerySchema`）

**方案：**

1. 改用 `(updatedAt, id)` 复合游标
2. 查询条件从 `updatedAt < cursor` 改为 `(updatedAt < cursor) OR (updatedAt = cursor AND id < cursorId)`
3. 更新 `noteListQuerySchema` 支持 `cursorId` 参数

---

## 二、中优先级

### 2.1 ⬜ 修复 ActionToolbarButton 中 key prop 误用

**问题：** `key` 被作为普通 prop 传入组件内部并透传到 DOM 元素，React 会发出警告。

**涉及文件：**

- `packages/editor/src/web/toolbar/action-toolbar-button.tsx`

**方案：**
将 `key` 从 props 解构中移除，改为在调用处使用 `key`。在组件内部使用 `id` 或其他命名替代。

---

### 2.2 ⬜ 依赖分类修正

**问题：** `@nicenote/tokens` 仅在构建脚本中使用，应为 `devDependencies`。

**涉及文件：**

- `apps/web/package.json`

**操作：**

```bash
cd apps/web
pnpm remove @nicenote/tokens
pnpm add -D @nicenote/tokens
```

---

### 2.3 ⬜ CI/CD 优化

**问题：**

- 3 个 job 各自独立 `pnpm install`，增加不必要耗时
- `deploy-api` 中 `pnpm dlx wrangler@4` 与本地 `package.json` 中的 wrangler 版本不一致
- 根目录配置文件（`turbo.json`、`pnpm-workspace.yaml`、`package.json`）变更未触发 CI

**涉及文件：**

- `.github/workflows/ci-cd.yml`

**方案：**

1. 在 `paths` trigger 中添加根目录配置文件
2. 统一 wrangler 使用方式（优先用 `pnpm --filter api deploy`）
3. 评估是否将 deploy 步骤合并到 quality job 后的同一 runner 中以复用 `node_modules`

---

### 2.4 ⬜ 统一 z-index 体系

**问题：** `z-70` 不在 Tailwind 默认 scale 中，可能违反 `tailwindcss/no-arbitrary-value` 规则。

**涉及文件：**

- `packages/editor/src/web/toolbar/command-dropdown-menu.tsx`
- `packages/editor/src/web/toolbar/link-toolbar-button.tsx`
- `packages/tokens/`（若需添加 z-index token）

**方案：**

1. 在 tokens 中定义 z-index 层级（如 `dropdown: 70`、`popover: 80`、`modal: 90`）
2. 通过 `generate-css.ts` 生成对应 CSS 变量
3. 替换硬编码的 `z-70` 为 token 引用

---

## 三、低优先级 / 代码质量

### 3.1 ⬜ 侧边栏列表语义化

**问题：** 笔记列表使用 `div` 嵌套，屏幕阅读器无法识别列表结构。

**涉及文件：**

- `apps/web/src/components/NotesSidebar.tsx`

**方案：**

1. 列表容器改为 `<ul role="list">`
2. 列表项改为 `<li role="listitem">`
3. 删除按钮 `aria-label` 改为 `aria-label={`Delete note: ${note.title}`}`

---

### 3.2 ⬜ 将字体栈纳入 tokens 体系

**问题：** `FONT_SANS_STACK` 和 `FONT_MONO_STACK` 硬编码在 `generate-css.ts` 中，不在 tokens 包内。

**涉及文件：**

- `packages/tokens/src/typography.ts`
- `apps/web/scripts/generate-css.ts`

**方案：**

1. 在 `packages/tokens/src/typography.ts` 中导出字体栈定义
2. 在 `generate-css.ts` 中引用 token 而非硬编码

---

### 3.3 ⬜ noteInsertSchema 收窄导出

**问题：** `noteInsertSchema` 暴露了 `id`、`createdAt`、`updatedAt` 字段，虽然路由层使用了更严格的 `noteCreateSchema`，但共享导出存在滥用风险。

**涉及文件：**

- `packages/shared/src/schemas.ts`
- `packages/shared/src/index.ts`

**方案：**

- 评估是否需要导出 `noteInsertSchema`；如仅用于 API 内部，可改为非导出或仅在 `apps/api` 中使用

---

### 3.4 ⬜ Input 组件添加 forwardRef

**问题：** `packages/ui` 的 `Input` 组件未使用 `forwardRef`，作为 UI 库组件不符合常规。

**涉及文件：**

- `packages/ui/src/components/input/input.tsx`

---

### 3.5 ⬜ Toast 无障碍优化

**问题：** `role="alert"` 隐含 `aria-live="assertive"`，对非关键通知过于激进；dismiss 按钮未关联具体 toast。

**涉及文件：**

- `apps/web/src/components/Toasts.tsx`

**方案：**

1. Toast 容器改用 `aria-live="polite"`
2. 单条 toast 改为 `role="status"`
3. dismiss 按钮添加 `aria-describedby` 关联对应 toast 内容

---

### 3.7 ⬜ 生成的 index.css 与 git 管理

**问题：** `index.css` 既是生成产物又纳入版本控制，token 变更产生噪声 diff。

**涉及文件：**

- `apps/web/src/index.css`
- `apps/web/scripts/generate-css.ts`
- `.gitignore`

**方案：**

- 将生成的 CSS 部分拆分到 `generated-tokens.css` 并加入 `.gitignore`，在 `index.css` 中 `@import` 引入
