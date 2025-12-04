<div align="center">
  <h1>Resource Scheduler</h1>
  <p>一个基于 Vue 2.7 的可视化资源排期组件库</p>
  <img src="./dist/scheduler-demo.png" alt="Scheduler Demo" style="max-width: 820px; width: 100%; margin-top: 12px" />
</div>

## 介绍

本仓库同时包含：
- 示例应用：基于 Vite + Vue 2.7 的演示页面（结合 ElementUI 与自定义样式）。
- 组件库打包：输出 ESM 与 UMD 两种格式，并生成完整 TypeScript 类型声明。

你可以：
- 直接运行示例应用进行修改与体验；
- 作为组件库安装到你的项目中使用；
- 通过 CDN 在非打包环境快速集成。

## Gantt Scheduler 组件

- 组件名：`<gantt-scheduler>`
- 路径：访问 `http://localhost:3000/scheduler` 以查看演示页面

### Props

- `readonly?: boolean` 只读模式，禁用拖拽与编辑
- `task: Staff[]` 必填，人员与任务数据数组（详见 `types.ts` 的 `Staff` 与 `Task`）
- `title?: string` 标题文本（若未提供 `#title` 插槽时显示）
- `description?: string` 描述文本（若未提供 `#description` 插槽时显示）

### 事件

- `@data-change` 当图表内数据发生变更时触发，事件载荷为 `Staff[]`

### 插槽

- `#title` 自定义标题区域
- `#description` 自定义描述区域
- `#avatar` 自定义头像区域（透传到每一行 `StaffRow`）
- `#workloadBar` 自定义工作量展示（透传到每一行 `StaffRow`）

### 访问性与键盘导航

- 根容器设置 `role="region"`，时间轴设置 `role="grid"`
- 键盘：`←/→` 平移视图，`Home` 跳到今天，`PageUp/PageDown` 切换时间段

### 主题

- 自动识别系统深色模式（`prefers-color-scheme`），并支持 `dark` 类切换

### 使用示例（Vue 2.7）

```html
<template>
  <gantt-scheduler :readonly="false" :task="staffs" title="人员排期" description="支持拖拽与编辑">
    <template #avatar="{ staff }">
      <img :src="staff.avatar" :alt="staff.name" class="w-8 h-8 rounded-full" />
    </template>
  </gantt-scheduler>
</template>

<script>
import { GanttScheduler } from '@zcodery/resource-scheduler'
export default { components: { GanttScheduler } }
</script>
```

### 类型与校验

- 完整 TypeScript 类型：`GanttSchedulerProps` 与事件载荷类型在 `types.ts`
- 运行时校验：对 `task` 数组进行基础结构验证，非法结构将被忽略

### 性能优化

- 使用 `vuedraggable` 按行拖拽；时间轴计算与提示信息按需更新；避免不必要的重绘，支持较大数据量

## 快速开始（本地运行示例应用）

前置要求：安装 Node.js

1. 安装依赖：`npm install`
2. 开发启动：`npm run dev`
3. 访问开发地址（默认）：`http://localhost:3000`

说明：示例应用使用 ElementUI 样式与少量 SCSS，自带演示数据与交互，无需额外安装 Tailwind。

## 作为组件库使用（npm）

安装：

`npm install @zcodery/resource-scheduler`

导入：

`import { StaffRow, TaskCard, WorkloadBar } from '@zcodery/resource-scheduler'`

类型声明：自动随包提供，来自 `dist/types`。

对等依赖（peerDependencies）：
- `vue >= 2.7.0`

## 通过 CDN 使用

ESM：

`import { StaffRow } from 'https://cdn.jsdelivr.net/npm/@zcodery/resource-scheduler@0.1.1/dist/resource-scheduler.es.js'`

UMD（全局对象 `window.ResourceScheduler`）：

`<script src="https://cdn.jsdelivr.net/npm/@zcodery/resource-scheduler@0.1.1/dist/resource-scheduler.umd.js"></script>`

示例：

`const { StaffRow, TaskCard } = window.ResourceScheduler`

可选镜像：将上面 CDN 域名替换为 `unpkg.com` 亦可。

## 组件入口与导出

库入口文件：`index.ts`，导出以下内容：
- 组件：`StaffRow`、`TaskCard`、`WorkloadBar`、`EditTaskModal`、`EditStaffModal`、`GanttScheduler`
- 类型：`types.ts` 中的类型
- 常量：`constants.ts` 中的默认样式常量

## Read

### 文档概述
- 本项目提供一个基于 Vue 2.7 的甘特图排期组件 `<gantt-scheduler>`，以及通过 Vite 驱动的示例页面。组件面向大型任务数据集，支持响应式布局、拖拽与调整工期、键盘导航、可访问性（ARIA）、深浅色主题、运行时数据校验，并提供完备的 TypeScript 类型与单元测试。

### 关键功能点
- 组件结构与路由：核心组件 `<gantt-scheduler>`，示例访问路径 `http://localhost:3000/scheduler`；库出口位于 `index.ts`。
- Props：`readonly?: boolean`、`task: Staff[]`、`title?: string`、`description?: string`（`components/GanttScheduler.vue`）。
- 事件：`@data-change` 在数据变更时触发，载荷为 `Staff[]`（`components/GanttScheduler.vue:237`）。
- 插槽：`#title`、`#description`、`#avatar`、`#workloadBar`，用于自定义标题、描述、头像和工作量条（`components/GanttScheduler.vue:23`、`components/StaffRow.vue:22`）。
- 交互：任务拖拽移动与左右拉伸（调整工期）、自动边缘滚动、双击网格新增任务、右键上下文菜单（新增/编辑/复制/删除/移动行/调整工期）、定位到任务/人员等（`components/GanttScheduler.vue:448`、`:585`）。
- 视图控制：支持月/季/年三种视图模式，快速导航到今天或到数据起点；顶部显示当前时间段标签，时间轴显示今日垂线（`components/GanttScheduler.vue:344`、`:402`、`:428`）。
- 可访问性：使用 `role="region"`、`role="grid"`、`role="columnheader"`、`role="dialog"` 等 ARIA 语义；键盘导航 `←/→` 平移、`Home` 回到今天、`PageUp/PageDown` 切段（`components/GanttScheduler.vue:4`、`:49`、`:97`、`:373`）。
- 主题与样式：SCSS 优化菜单与导航样式，融合 ElementUI 风格（`components/gantt-scheduler.vue:1409`）。
- 数据校验与持久化：对 `task` 进行运行时结构校验；`localStorage` 持久化变更并广播 `window` 事件（`components/GanttScheduler.vue:356`、`:235`）。
- 性能优化：细粒度状态更新、自动滚动、避免不必要重绘，适配较大数据集（`components/GanttScheduler.vue:440`）。
- 类型：`types.ts` 包含 `Staff`、`Task`、`DayInfo`、`GanttSchedulerProps` 等。

### 使用说明
- 环境准备：
  - Node.js（建议最新 LTS）
  - Vue `>=2.7.0`（通过 `vite-plugin-vue2`）
  - ElementUI `2.15.14`
- 本地运行示例：
  1. 安装依赖：`npm install`
  2. 启动开发：`npm run dev`
  3. 访问示例：`http://localhost:3000/scheduler`
  4. 只读模式：可通过 URL 查询参数 `?readonly=1` 或在 `.env` 设置 `VITE_READONLY=true`（`main.ts:13-18`）。
- 作为组件库使用：
  - 安装：`npm install @zcodery/resource-scheduler`
  - 导入：`import { GanttScheduler } from '@zcodery/resource-scheduler'`
  - 使用示例：
    ```html
    <gantt-scheduler :readonly="false" :task="staffs" title="人员排期" description="支持拖拽与编辑">
      <template #avatar="{ staff }">
        <img :src="staff.avatar" :alt="staff.name" class="w-8 h-8 rounded-full" />
      </template>
    </gantt-scheduler>
    ```
- 数据模型（`types.ts`）：
  - `Task`: `id`, `name`, `startDate(YYYY-MM-DD)`, `duration(days)`, `rowOffset`
  - `Staff`: `id`, `name`, `role`, `avatar?`, `avatarColor`, `workloadPercentage`, `tasks: Task[]`, `isCollapsed?`
- 事件监听：
  - 组件实例：`this.$on('data-change', (val: Staff[]) => { ... })`
  - 全局：`window.addEventListener('scheduler:data-change', (e) => { /* e.detail: Staff[] */ })`
- 构建与类型：
  - 构建库：`npm run build:lib`
  - 生成类型：`npm run build:types`
  - 一次性：`npm run build:pkg`


### 注意事项
- 只读模式会禁用任务拖拽/调整等交互；上下文菜单与快捷键部分功能也受限。
- 示例数据变更会持久化到 `localStorage`；如需关闭持久化，请自行移除相关 `watch` 与 `localStorage` 写入逻辑。
- `task` Prop 进行运行时结构校验；非法结构将导致组件内部数据集为空。
- 依赖要求：`vue >=2.7.0`、`element-ui 2.15.14`、`vuedraggable`。Tailwind 通过 CDN 加载，仅用于示例样式。
- 安全：`vite.config.ts` 中存在对 `process.env.*` 的注入示例，切勿在仓库中直接暴露真实密钥。
- 路由：示例应用未使用 `vue-router`，通过 `window.location.pathname` 控制在 `/scheduler` 渲染（`main.ts:19-33`）。
- 构建模式：通过 `env.BUILD_LIB` 切换库构建；发布时请确保 `peerDependencies` 与 `exports` 配置正确。

### 版本信息
- 当前版本：`0.1.1`
- 变更摘要：
  - 新增 `<gantt-scheduler>` 组件与示例路由 `/scheduler`。
  - 完善 Props/Slots/事件文档与 README 使用说明。
  - 增加 TypeScript 类型（`GanttSchedulerProps` 与事件载荷）。
  - 引入 `Vitest` 测试并覆盖 Props、Slots、事件。
  - 优化可访问性与深色主题支持，添加性能优化（边缘滚动、细粒度更新）。
- 依赖版本：
  - `vue >=2.7.0`
  - `element-ui 2.15.14`
  - `vite ^4.5.x`
  - `vite-plugin-vue2 ^2.0.x`

## 构建与发布

构建库产物与类型：
- `npm run build:lib` 生成 `dist/resource-scheduler.es.js` 与 `dist/resource-scheduler.umd.js`
- `npm run build:types` 生成 `dist/types/*.d.ts`
- `npm run build:pkg` 一次性生成库与类型

验证打包内容：
- `npm pack` 生成 tarball 并打印包含文件列表

发布到 npm：
1. 确认登录：`npm whoami`（未登录则 `npm login`）
2. 包名与作用域：当前包名为 `@zcodery/resource-scheduler`，如需更换请修改 `package.json:name` 并确保你拥有该作用域权限。
3. 构建产物：`npm run build:pkg`（生成 `dist/*` 与 `dist/types/*`）
4. 发布：`npm publish --access public`

常见错误：
- `E403 You do not have permission`：该包名已被占用或你不是该包名所有者；请使用你拥有的作用域或更换包名。
- `You cannot publish over the previously published versions`：请提升版本号（`npm version patch` 或手动更新 `package.json:version`），再重新构建并发布。

更多发布细节与排错：可通过 `npm pack` 检查打包内容，或查看发布日志中的 `C:\Users\<你的用户名>\AppData\Local\npm-cache\_logs\*.log`。

## 示例应用说明

- Tailwind：通过 CDN 加载，位于 `index.html` 的 `<script src="https://cdn.tailwindcss.com"></script>`。
- Vue/ElementUI：示例应用采用 Vue 2.7 与 ElementUI，样式位于组件与 `styles.css` 中。
- Vite 开发服务器端口：`vite.config.ts` 中配置为 `3000`。
- GitHub Pages 部署：工作流位于 `.github/workflows/deploy.yml`，自动设置 `vite` 的 `base` 路径并上传 `dist`。

## 许可证

MIT

## 相关文档

- 使用示例与集成指南：`docs/USAGE.md`
- 发布与排错指南：`docs/PUBLISHING.md`
