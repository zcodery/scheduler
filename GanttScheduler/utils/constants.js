export const WEEK_DAYS = ["日", "一", "二", "三", "四", "五", "六"]

export const DEFAULT_TASK_BG = "#fff2df"
export const DEFAULT_TASK_TEXT = "#ff7a00"

export const SIDEBAR_WIDTH = 260

// 单天的毫秒数，用于日期换算与像素换算
export const ONE_DAY_MS = 86400000
// 月/季视图下单天网格宽度（像素），影响时间轴栅格和任务宽度
export const DAY_CELL_PX = 50
// 年/季视图下单月列宽（像素），用于按月布局和日内宽度计算
export const MONTH_COLUMN_PX = 120

export const AVATAR_COLOR_CLASSES = ["bg-blue-100 text-blue-600", "bg-green-100 text-green-600", "bg-yellow-100 text-yellow-600", "bg-orange-100 text-orange-600", "bg-red-100 text-red-600", "bg-purple-100 text-purple-600", "bg-pink-100 text-pink-600", "bg-gray-100 text-gray-600", "bg-emerald-100 text-emerald-600", "bg-indigo-100 text-indigo-600", "bg-rose-100 text-rose-600"]

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
