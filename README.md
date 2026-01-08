# Resource Scheduler
一个基于 Vue 2.7 的可视化资源排期组件库
![Scheduler Demo](https://i-blog.csdnimg.cn/direct/f1af0b0d77174470a407cb017504945e.png)

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

### Props

| 参数          | 类型      | 说明                                                       | 默认值                             |
| ------------- | --------- | ---------------------------------------------------------- | ---------------------------------- |
| `readonly`    | `boolean` | 只读模式，禁用拖拽与编辑                                   | 否                                 |
| `task`        | `Staff[]` | 人员与任务数据数组（详见 `types.ts` 的 `Staff` 与 `Task`） | -                                  |
| `title`       | `string`  | 标题文本（未提供 `#title` 插槽时显示）                     | 人员排期                           |
| `description` | `string`  | 描述文本（未提供 `#description` 插槽时显示）               | 拖动图表滑动 • 双击编辑 • 右键管理 |

### 事件
 
 - `@data-change` 当图表内数据发生变更时触发，返回一个结构化对象：
   - `payload`：所有人员的最新完整数据，格式与系统一致
   - `changedStaff`：当前被修改/新增/删除的人员对象
   - `changedTask`：当前被修改/新增/删除的任务对象；人员操作时为 `null`
   - `editType`：操作类型，取值为 `"add" | "edit" | "delete"`
 
  说明：
  - 初始化加载与纯视图操作不会触发该事件，仅在新增/编辑/删除人员或任务时触发

### 插槽

| 插槽名              | 说明                                                          |
| ------------------- | ------------------------------------------------------------- |
| `#title`            | 自定义标题区域                                                |
| `#description`      | 自定义描述区域                                                |
| `#extra`            | 自定义按钮区域                                                |
| `#avatar`           | 自定义头像区域（透传到每一行 `StaffRow`）                     |
| `#workloadBar`      | 自定义工作量展示（透传到每一行 `StaffRow`）                   |
| `#staffDescription` | 自定义人员描述展示（仅展示，无编辑；作用域：`staff`, `role`） |

### 使用示例（Vue 2.7）

```html
<template>
  <gantt-scheduler :readonly="readonly" :task="staffs" :title="title" :description="description" :staffConfig="staffConfig" @data-change="onDataChange">
    <template #staffDescription="{ staff }">
      <el-tag size="mini" type="primary" effect="plain">{{ staff.role || '未设置职位' }}</el-tag>
    </template>
    <template #extra>
      <el-button v-if="!readonly" size="mini" type="success" @click="onSave">保存</el-button>
      <el-switch size="mini" v-model="readonly" active-color="#13ce66" inactive-color="#409eff" :active-text="readonly ? '只读模式' : '编辑模式'"></el-switch>
    </template>
  </gantt-scheduler>
  
</template>

<script>
import { GanttScheduler } from '@zcodery/resource-scheduler'
export default {
  components: { GanttScheduler },
  data() {
    return {
      title: '人员排期',
      description: '拖动图表滑动 • 双击编辑 • 右键管理',
      readonly: false,
      staffs: [],
      staffConfig: [
        { span: 12, prop: 'role', label: '职位', type: 'picker', component: 'el-select', params: { placeholder: '选择职位', options: ['前端工程师','后端工程师','测试工程师','产品经理','设计师','项目经理'], class: '!w-full' } },
        { span: 12, prop: 'hobby', label: '爱好', type: 'field', component: 'el-select', params: { placeholder: '选择爱好', options: ['篮球','足球','跑步','游泳','旅游','其他'], class: '!w-full', multiple: true, allowCreate: true, filterable: true } },
        { prop: 'workloadPercentage', label: '进度(%)', type: 'field', component: 'el-input-number', params: { min: 0, max: 100, step: 1, class: '!w-full' } },
      ],
    }
  },
}
</script>
```

## 作为组件库使用（npm）

安装：

```sh
npm install @zcodery/resource-scheduler
```

导入：

```javascript
import { GanttScheduler } from '@zcodery/resource-scheduler'
```

类型声明：自动随包提供，来自 `dist/types`。

对等依赖（peerDependencies）：
- `vue >= 2.7.0`

## 通过 CDN 使用

ESM：

```sh
import { GanttScheduler } from 'https://cdn.jsdelivr.net/npm/@zcodery/resource-scheduler@latest/dist/resource-scheduler.es.js'
```

UMD（全局对象 `window.ResourceScheduler`）：

```html
<script src="https://cdn.jsdelivr.net/npm/@zcodery/resource-scheduler@latest/dist/resource-scheduler.umd.js"></script>
```

示例：

```javascript
const { GanttScheduler } = window.ResourceScheduler
```

可选镜像：将上面 CDN 域名替换为 `unpkg.com` 亦可。

注意：UMD 使用需同时加载 `vuedraggable`。

## 组件入口与导出

库入口文件：`index.ts`。
- 公共组件：`GanttScheduler`（稳定公共 API）
- 公共类型：`types.ts` 中的类型
- 公共常量：`constants.ts` 中的默认样式常量

## 导入限制与架构边界（重要）

- 外部项目仅应从包入口导入：`import { GanttScheduler } from '@zcodery/resource-scheduler'`。
- 禁止直接从 `components/*` 目录导入内部组件；这些为库内部实现细节，不保证跨版本稳定。
- CDN/UMD 使用时，仅访问 `window.ResourceScheduler.GanttScheduler`。
- 公共类型与常量可安全导入：`import { /* types, constants */ } from '@zcodery/resource-scheduler'`。

## 许可证

MIT

