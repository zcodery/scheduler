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
      { id: "T009", name: "环境延伸与遮罩合成", startDate: getRelativeDate(-2), duration: 3, rowOffset: 0 },
      { id: "T013", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(0), duration: 4, rowOffset: 1 },
      { id: "T017", name: "主角特写合成渲染", startDate: getRelativeDate(2), duration: 5, rowOffset: 2 },
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
      { id: "T006", name: "环境延伸与遮罩", startDate: getRelativeDate(-1), duration: 3, rowOffset: 0 },
      { id: "T010", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(1), duration: 3, rowOffset: 1 },
      { id: "T014", name: "主角特写合成", startDate: getRelativeDate(3), duration: 5, rowOffset: 2 },
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
      { id: "T007", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(-3), duration: 3, rowOffset: 0 },
      { id: "T011", name: "主角特写合成", startDate: getRelativeDate(0), duration: 3, rowOffset: 1 },
      { id: "T015", name: "环境延伸与遮罩", startDate: getRelativeDate(4), duration: 5, rowOffset: 2 },
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
      { id: "T008", name: "主角特写合成", startDate: getRelativeDate(-2), duration: 3, rowOffset: 0 },
      { id: "T012", name: "环境延伸与遮罩", startDate: getRelativeDate(1), duration: 3, rowOffset: 1 },
      { id: "T016", name: "赛博朋克追逐场次 V1", startDate: getRelativeDate(3), duration: 5, rowOffset: 2 },
    ],
  },
]

export const PRESET_TASK_COLORS = [
  { color: "rgb(255, 255, 255)", name: "白色" },
  { color: "rgb(78, 131, 253)", name: "蓝色-3" },
  { color: "rgb(20, 192, 255)", name: "青色-3" },
  { color: "rgb(0, 214, 185)", name: "蓝绿色-3" },
  { color: "rgb(52, 199, 36)", name: "绿色-3" },
  { color: "rgb(179, 214, 0)", name: "黄绿色-3" },
  { color: "rgb(255, 242, 88)", name: "黄色-3" },
  { color: "rgb(255, 136, 0)", name: "橙色-3" },
  { color: "rgb(245, 74, 69)", name: "红色-3" },
  { color: "rgb(241, 75, 169)", name: "粉色-3" },
  { color: "rgb(127, 59, 245)", name: "紫色-3" },
  { color: "rgb(248, 249, 250)", name: "灰色-1" },
  { color: "rgb(225, 234, 255)", name: "蓝色-1" },
  { color: "rgb(217, 243, 253)", name: "青色-1" },
  { color: "rgb(213, 246, 242)", name: "蓝绿色-1" },
  { color: "rgb(217, 245, 214)", name: "绿色-1" },
  { color: "rgb(238, 246, 198)", name: "黄绿色-1" },
  { color: "rgb(250, 241, 209)", name: "黄色-1" },
  { color: "rgb(254, 212, 164)", name: "橙色-1" },
  { color: "rgb(251, 191, 188)", name: "红色-1" },
  { color: "rgb(253, 221, 239)", name: "粉色-1" },
  { color: "rgb(236, 226, 254)", name: "紫色-1" },
  { color: "rgb(222, 224, 227)", name: "灰色-2" },
  { color: "rgb(186, 206, 253)", name: "蓝色-2" },
  { color: "rgb(126, 218, 251)", name: "青色-2" },
  { color: "rgb(100, 232, 214)", name: "蓝绿色-2" },
  { color: "rgb(142, 224, 133)", name: "绿色-2" },
  { color: "rgb(195, 221, 64)", name: "黄绿色-2" },
  { color: "rgb(250, 211, 85)", name: "黄色-2" },
  { color: "rgb(255, 186, 107)", name: "橙色-2" },
  { color: "rgb(247, 105, 100)", name: "红色-2" },
  { color: "rgb(245, 122, 192)", name: "粉色-2" },
  { color: "rgb(173, 130, 247)", name: "紫色-2" },
  { color: "rgb(143, 149, 158)", name: "灰色-3" },
  { color: "rgb(51, 112, 255)", name: "蓝色-4" },
  { color: "rgb(4, 159, 215)", name: "青色-4" },
  { color: "rgb(4, 180, 156)", name: "蓝绿色-4" },
  { color: "rgb(46, 161, 33)", name: "绿色-4" },
  { color: "rgb(143, 172, 2)", name: "黄绿色-4" },
  { color: "rgb(255, 198, 10)", name: "黄色-4" },
  { color: "rgb(222, 120, 2)", name: "橙色-4" },
  { color: "rgb(216, 57, 49)", name: "红色-4" },
  { color: "rgb(240, 29, 148)", name: "粉色-4" },
  { color: "rgb(100, 37, 208)", name: "紫色-4" },
  { color: "rgb(55, 60, 67)", name: "灰色-4" },
  { color: "rgb(36, 91, 219)", name: "蓝色-5" },
  { color: "rgb(3, 126, 170)", name: "青色-5" },
  { color: "rgb(3, 99, 86)", name: "蓝绿色-5" },
  { color: "rgb(24, 96, 16)", name: "绿色-5" },
  { color: "rgb(102, 121, 1)", name: "黄绿色-5" },
  { color: "rgb(220, 155, 4)", name: "黄色-5" },
  { color: "rgb(143, 79, 4)", name: "橙色-5" },
  { color: "rgb(129, 37, 32)", name: "红色-5" },
  { color: "rgb(158, 19, 97)", name: "粉色-5" },
  { color: "rgb(56, 13, 130)", name: "紫色-5" },
  { color: "rgb(31, 35, 41)", name: "灰色-5" },
  { color: "rgb(19, 60, 154)", name: "蓝色-6" },
  { color: "rgb(0, 97, 133)", name: "青色-6" },
  { color: "rgb(2, 75, 65)", name: "蓝绿色-6" },
  { color: "rgb(18, 75, 12)", name: "绿色-6" },
  { color: "rgb(73, 87, 0)", name: "黄绿色-6" },
  { color: "rgb(121, 81, 1)", name: "黄色-6" },
  { color: "rgb(107, 57, 0)", name: "橙色-6" },
  { color: "rgb(98, 28, 24)", name: "红色-6" },
  { color: "rgb(122, 15, 75)", name: "粉色-6" },
  { color: "rgb(39, 5, 97)", name: "紫色-6" },
]
