# 项目架构评估报告

> 评估日期：2026-02-15

经过对整个 monorepo 的全面扫描，以下是发现的主要问题：

---

## 1. `@nicenote/shared` 包严重膨胀（最高优先级）

shared 包共约 **1,900 行代码**，但实际被使用的仅约 **15%**。以下模块 **从未被任何包引用**：

| 模块                | 行数 | 状态                                       |
| ------------------- | ---- | ------------------------------------------ |
| `request.ts`        | ~358 | 完整 HTTP 客户端（含拦截器、重试），零使用 |
| `storage.ts`        | ~220 | 存储适配器模式，零使用                     |
| `debounce.ts`       | ~183 | debounce/throttle 实现，零使用             |
| `random.ts`         | ~149 | 随机数/数组工具，零使用                    |
| `constants.ts`      | ~120 | 全部常量（API_TIMEOUT 等），零使用         |
| `deepClone.ts`      | ~114 | 深拷贝，零使用                             |
| `sleep.ts`          | ~63  | sleep 工具，零使用                         |
| `parsers.ts` 大部分 | ~180 | parseQuery/parseUrl/toKebabCase 等，零使用 |

**实际被使用的仅有：**

- `schemas.ts` — API 和 web 共用的 Zod schema 和类型（核心）
- `validators.ts` 中的 `getLinkValidationError` — editor 包引用
- `platform.ts` 中的 `parseShortcutKeys` — UI 包引用
- `formatDate.ts` 中的部分函数

**建议：** 删除所有未使用模块（约 1,300 行），shared 包应只保留真正跨包共享的代码。

---

## 2. `@nicenote/contract` 包拆解不彻底

contract 包的文件已移走（schemas → shared，routes → api），但以下残留未清理：

- `eslint.config.js:153` — no-restricted-imports 的错误提示仍写着 `Import contract types from @nicenote/contract`，应改为 `@nicenote/shared`
- `CLAUDE.md:11` — 仍描述 `packages/contract/` 存在
- `tsconfig.madge.json` — 可能仍有 contract 路径映射

**建议：** 全局搜索 `@nicenote/contract` 引用并清理。

---

## 3. Throttle 实现重复

两处独立的 throttle 实现：

- `packages/shared/src/debounce.ts` — 原生 TypeScript 实现（但从未被使用）
- `packages/ui/src/hooks/use-throttled-callback.ts` — 引入了 `lodash.throttle` 外部依赖

**建议：** 如果 shared 的 throttle 要保留，UI 包应复用它并移除 `lodash.throttle` 依赖；否则两者都可以简化。

---

## 4. Tiptap 专属 Hook 放在了通用 UI 包中

`packages/ui/src/hooks/tiptap/use-menu-navigation.ts` 直接操作 `editor.view.dom`，是 Tiptap 编辑器特有的逻辑，不应存在于通用 UI 组件库中。

同时 UI 包的 `package.json` 也因此引入了 `@tiptap/core` 和 `@tiptap/react` 依赖。

**建议：** 将 `use-menu-navigation.ts` 移入 `packages/editor/`，并移除 UI 包对 Tiptap 的依赖。

---

## 5. TypeScript 配置小问题

- `packages/shared/tsconfig.json` 的 `lib` 包含 `"DOM"` — 但 shared 是非 UI 的纯工具包，不应依赖 DOM 类型
- 可能是因为 `storage.ts`（使用 localStorage）和 `platform.ts`（使用 navigator）需要 DOM，但如果这些模块被清理，DOM lib 就应移除

---

## 6. 架构设计良好的部分

以下方面无需改动，设计质量高：

- **API 层（apps/api）：** 路由 → 服务 → 数据库三层分离清晰，依赖注入模式便于测试，类型断言确保 Drizzle schema 与 Zod schema 同步
- **端到端类型安全：** `AppType` 从 API 导出，web 通过 Hono RPC 客户端消费，零运行时耦合
- **Web 状态管理：** Zustand store 结构清晰，乐观更新 + 防抖保存模式合理
- **Monorepo 工具链：** pnpm + Turborepo + ESLint flat config + Prettier 配置一致
- **CI/CD：** PR 质量门禁 + 自动部署流程完整

---

## 总结优先级

| 优先级 | 问题                                     | 预计清理量        |
| ------ | ---------------------------------------- | ----------------- |
| **P0** | 删除 shared 包未使用模块                 | ~1,300 行         |
| **P1** | 清理 contract 包残留引用                 | 3-5 处            |
| **P1** | 移动 Tiptap hook 到 editor 包            | 1 文件 + 依赖调整 |
| **P2** | 统一 throttle 实现，移除 lodash.throttle | 2 文件            |
| **P2** | 修正 shared tsconfig 的 DOM lib          | 1 行              |
