<div align="center">
  <h1>Resource Scheduler</h1>
  <p>一个可视化的资源排期组件库与示例应用</p>
</div>

## 介绍

本仓库同时包含：
- 示例应用：基于 Vite + React 的演示页面（使用 Tailwind CDN）。
- 组件库打包：输出 ESM 与 UMD 两种格式，并生成完整 TypeScript 类型声明。

你可以：
- 直接运行示例应用进行修改与体验；
- 作为组件库安装到你的项目中使用；
- 通过 CDN 在非打包环境快速集成。

## 快速开始（本地运行示例应用）

前置要求：安装 Node.js

1. 安装依赖：`npm install`
2. 开发启动：`npm run dev`
3. 访问开发地址（默认）：`http://localhost:3000`

说明：示例应用使用 Tailwind CDN 与 importmap 加载 React，已在 `index.html` 配置，无需本地额外安装 Tailwind。

## 作为组件库使用（npm）

安装：

`npm install @basefount/resource-scheduler`

导入：

`import { StaffRow, TaskCard, WorkloadBar } from '@basefount/resource-scheduler'`

类型声明：自动随包提供，来自 `dist/types`。

对等依赖（peerDependencies）：
- `react >= 18`
- `react-dom >= 18`
- `lucide-react >= 0.555.0`

## 通过 CDN 使用

ESM：

`import { StaffRow } from 'https://cdn.jsdelivr.net/npm/@basefount/resource-scheduler@0.1.0/dist/resource-scheduler.es.js'`

UMD（全局对象 `window.ResourceScheduler`）：

`<script src="https://cdn.jsdelivr.net/npm/@basefount/resource-scheduler@0.1.0/dist/resource-scheduler.umd.js"></script>`

示例：

`const { StaffRow, TaskCard } = window.ResourceScheduler`

可选镜像：将上面 CDN 域名替换为 `unpkg.com` 亦可。

## 组件入口与导出

库入口文件：`index.ts`，导出以下内容：
- 组件：`StaffRow`、`TaskCard`、`WorkloadBar`、`EditTaskModal`、`EditStaffModal`、`ColorPresetPicker`、`Confirm`、`PopoverColorPicker`
- 类型：`types.ts` 中的类型
- 常量：`constants.ts` 中的默认样式常量

## 构建与发布

构建库产物与类型：
- `npm run build:lib` 生成 `dist/resource-scheduler.es.js` 与 `dist/resource-scheduler.umd.js`
- `npm run build:types` 生成 `dist/types/*.d.ts`
- `npm run build:pkg` 一次性生成库与类型

验证打包内容：
- `npm pack` 生成 tarball 并打印包含文件列表

发布到 npm：
1. 确认登录：`npm whoami`（未登录则 `npm login`）
2. 包名作用域：当前包名为 `@basefount/resource-scheduler`，请确保作用域与您的 npm 用户/组织匹配；如不匹配，可改为 `@你的作用域/resource-scheduler`，或换成未占用的普通名称。
3. 发布：`npm publish --access public`

常见错误：
- `E403 You do not have permission`：该包名已被占用或你不是该包名所有者；请使用你拥有的作用域或更换包名。

更多发布细节与排错见 `docs/PUBLISHING.md`。

## 示例应用说明

- Tailwind：通过 CDN 加载，位于 `index.html` 的 `<script src="https://cdn.tailwindcss.com"></script>`。
- React/ReactDOM/lucide-react：使用 importmap 指向 CDN，详见 `index.html`。
- Vite 开发服务器端口：`vite.config.ts` 中配置为 `3000`。
- GitHub Pages 部署：工作流位于 `.github/workflows/deploy.yml`，自动设置 `vite` 的 `base` 路径并上传 `dist`。

## 许可证

MIT

## 相关文档

- 使用示例与集成指南：`docs/USAGE.md`
- 发布与排错指南：`docs/PUBLISHING.md`
