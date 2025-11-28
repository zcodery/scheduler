import { Staff } from "./types"

export const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"]

export const DEFAULT_TASK_BG = "#e0e7ff"
export const DEFAULT_TASK_TEXT = "#3730a3"

// Helper to create dates relative to today
const getRelativeDate = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const MOCK_STAFF_DATA: Staff[] = [
  {
    id: "1",
    name: "张三",
    role: "特效师",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    avatarColor: "bg-blue-100 text-blue-600",
    workloadPercentage: 65,
    isCollapsed: false,
    tasks: [
      { id: "SH009", name: "环境延伸与遮罩合成", startDate: getRelativeDate(-2), duration: 3, rowOffset: 0 },
      { id: "SH013", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(0), duration: 4, rowOffset: 1 },
      { id: "SH017", name: "主角特写合成渲染", startDate: getRelativeDate(2), duration: 5, rowOffset: 2 },
    ],
  },
  {
    id: "2",
    name: "李四",
    role: "合成师",
    avatarColor: "bg-emerald-100 text-emerald-600",
    workloadPercentage: 45,
    isCollapsed: false,
    tasks: [
      { id: "SH006", name: "环境延伸与遮罩", startDate: getRelativeDate(-1), duration: 3, rowOffset: 0 },
      { id: "SH010", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(1), duration: 3, rowOffset: 1 },
      { id: "SH014", name: "主角特写合成", startDate: getRelativeDate(3), duration: 5, rowOffset: 2 },
    ],
  },
  {
    id: "3",
    name: "王五",
    role: "动画师",
    avatarColor: "bg-purple-100 text-purple-600",
    workloadPercentage: 10,
    isCollapsed: false,
    tasks: [
      { id: "SH007", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(-3), duration: 3, rowOffset: 0 },
      { id: "SH011", name: "主角特写合成", startDate: getRelativeDate(0), duration: 3, rowOffset: 1 },
      { id: "SH015", name: "环境延伸与遮罩", startDate: getRelativeDate(4), duration: 5, rowOffset: 2 },
    ],
  },
  {
    id: "4",
    name: "赵六",
    role: "模型师",
    avatarColor: "bg-orange-100 text-orange-600",
    workloadPercentage: 90,
    isCollapsed: false,
    tasks: [
      { id: "SH008", name: "主角特写合成", startDate: getRelativeDate(-2), duration: 3, rowOffset: 0 },
      { id: "SH012", name: "环境延伸与遮罩", startDate: getRelativeDate(1), duration: 3, rowOffset: 1 },
      { id: "SH016", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(3), duration: 5, rowOffset: 2 },
    ],
  },
]
