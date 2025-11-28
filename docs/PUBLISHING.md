# 发布与排错指南

## 准备

1. 登录 npm：`npm whoami` / `npm login`
2. 包名：建议使用你的作用域，如 `@your-scope/resource-scheduler`
3. 版本：更新 `package.json` 的 `version`

## 构建与验证

- 生成产物与类型：`npm run build:pkg`
- 检查打包内容：`npm pack`

## 发布

`npm publish --access public`

说明：如果是作用域包并且需公开访问，务必加上 `--access public` 或设置 `publishConfig.access: "public"`

## 常见错误与处理

- E403 权限错误：
  - 包名已被占用或你不是所有者；
  - 解决：改用你的作用域或更换未占用名称；确认 `npm whoami` 正确。

- 入口不正确：
  - 确认 `main/module/types/exports` 指向 `dist` 文件；
  - UMD 全局名：`ResourceScheduler`，由构建配置决定。

- 类型缺失：
  - 运行 `npm run build:types`，检查 `dist/types/index.d.ts` 是否存在。

## CDN 使用

- jsDelivr：`https://cdn.jsdelivr.net/npm/@scope/resource-scheduler@x.y.z/dist/...`
- unpkg：`https://unpkg.com/@scope/resource-scheduler@x.y.z/dist/...`

## 版本与变更日志

- 建议遵循语义化版本（SemVer），在每次发布更新 `CHANGELOG.md`。
