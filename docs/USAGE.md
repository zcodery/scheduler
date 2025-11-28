# 使用与集成指南

## 在 React 项目中使用（npm）

### 安装

`npm install @basefount/resource-scheduler react react-dom lucide-react`

说明：`react/react-dom/lucide-react` 在你的项目中通常已存在；若不存在，请一并安装。

### 基本示例

```tsx
import React from 'react'
import { StaffRow, TaskCard, WorkloadBar, Staff, Task, DayInfo, ViewMode } from '@basefount/resource-scheduler'

const headers: DayInfo[] = Array.from({ length: 14 }).map((_, i) => {
  const date = new Date()
  date.setDate(date.getDate() + i)
  const label = `${date.getMonth() + 1}/${date.getDate()}`
  return { date, label, isToday: i === 0 }
})

const staff: Staff = {
  id: 's-1',
  name: 'Alice',
  role: 'Engineer',
  avatarColor: 'bg-blue-100 text-blue-600',
  workloadPercentage: 70,
  tasks: [
    { id: 't-1', name: 'Feature A', startDate: '2025-12-01', duration: 5, rowOffset: 0 },
    { id: 't-2', name: 'Feature B', startDate: '2025-12-07', duration: 3, rowOffset: 1 },
  ],
}

export default function Example() {
  const viewStartDate = new Date('2025-12-01')
  const viewDurationMs = 14 * 86400000
  const viewMode: ViewMode = 'month'

  return (
    <div className="p-4">
      <StaffRow
        staff={staff}
        headers={headers}
        viewStartDate={viewStartDate}
        viewDurationMs={viewDurationMs}
        viewMode={viewMode}
        onStaffDragStart={() => {}}
        onStaffDragEnter={() => {}}
        onStaffDrop={() => {}}
        onContextMenu={() => {}}
        onToggleCollapse={() => {}}
        onTaskUpdate={() => {}}
        onResizeStart={() => {}}
        onTaskMouseDown={() => {}}
        onStaffUpdate={() => {}}
      />
    </div>
  )}
```

### 样式

- 组件使用了类似 Tailwind 的类名；你可以：
  - 使用 Tailwind（推荐）：在项目中配置 Tailwind；
  - 或者：自行提供对应 CSS 类（最少保证布局与颜色类）。

### 类型与常量

- 所有类型在 `dist/types/*.d.ts` 中提供；IDE 会自动识别。
- 默认任务背景/文字颜色在 `constants` 中可用。

## 通过 CDN 快速集成

### ESM 方式

```html
<script type="module">
  import { StaffRow } from 'https://cdn.jsdelivr.net/npm/@basefount/resource-scheduler@0.1.0/dist/resource-scheduler.es.js'
  // 你的代码...
  console.log(StaffRow)
</script>
```

### UMD 方式（全局）

```html
<script src="https://cdn.jsdelivr.net/npm/@basefount/resource-scheduler@0.1.0/dist/resource-scheduler.umd.js"></script>
<script>
  const { StaffRow } = window.ResourceScheduler
  console.log(StaffRow)
</script>
```

## 常见问题

- E403 发布权限错误：请使用你拥有的作用域或更换包名。
- 样式不生效：确保 Tailwind 已配置或提供必要 CSS 类。
