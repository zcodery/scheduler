import { Staff } from "@/GanttScheduler/types"

export const MOCK_ROLE_DATA = ["特效师", "合成师", "动画师", "模型师", "导演", "前端工程师", "后端工程师", "测试工程师", "产品经理", "设计师", "项目经理", "运营经理", "客户服务代表"]
export const MOCK_STAFF_NAME_DATA = ["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"]
export const MOCK_STAFF_AVATAR_DATA = ["https://api.dicebear.com/7.x/avataaars/svg?seed=Felix", "https://api.dicebear.com/7.x/avataaars/svg?seed=Max", "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie", "https://api.dicebear.com/7.x/avataaars/svg?seed=Cooper", "https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy", "https://api.dicebear.com/7.x/avataaars/svg?seed=Oscar", "https://api.dicebear.com/7.x/avataaars/svg?seed=Millie", "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy"]
export const MOCK_TASK_NAME_DATA = ["项目管理中心", "采购部", "项目管理办公室", "IP开发部", "展陈部", "品宣业务中心", "售前三部", "导演部", "两点十分文化", "总经办", "营销中心", "客户售前一部", "客户售前二部", "财务中心", "综合中心", "制片中心", "供应链中心", "文创产品中心", "市场运营中心", "研发中心", "AI创制中心", "品牌宣发中心", "业务增长部", "品宣策划部", "企业发展中心", "公共事务部", "幻彩工作室", "智绘工作室", "牧云工作室", "时光工作室", "起飞工作室", "雷霆工作室", "ACE工作室", "鱼渊工作室", "拂晓教育中心", "创引力文化", "MIX工作室", "蓝鲸工作室", "星光工作室", "梵星工作室", "可意工作室", "加法工作室", "星辰十分", "银行", "制作税点", "制包", "跨界自包", "心智网络", "-----以下是老数据，慎用-----", "种梦工作室", "组织流程部", "跨界供应链中心", "教育中心", "声光记", "策创中心", "一视工作室", "十方工作室", "仙禄文化", "时帧", "包装工作室", "燃梦文化", "客户售前部", "十二色", "独角兽"]

// Helper to create dates relative to today
const getRelativeDate = (offsetDays: number) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export const getMockStaffData = (count: number = 0): Staff[] => {
  count = count || Math.ceil(Math.random() * 50)
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: MOCK_STAFF_NAME_DATA[Math.floor(Math.random() * MOCK_STAFF_NAME_DATA.length)],
    role: MOCK_ROLE_DATA[Math.floor(Math.random() * MOCK_ROLE_DATA.length)],
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    workloadPercentage: Math.ceil(Math.random() * 100),
    isCollapsed: false,
    tasks: Array.from({ length: Math.ceil(Math.random() * count) }, (_, i) => ({ id: `T${(i + 1).toString().padStart(3, "0")}`, name: MOCK_TASK_NAME_DATA[Math.floor(Math.random() * MOCK_TASK_NAME_DATA.length)], startDate: getRelativeDate(Math.random() < 0.3 ? -Math.ceil(Math.random() * 10) : Math.ceil(Math.random() * 10)), duration: Math.ceil(Math.random() * 10), rowOffset: Math.floor(Math.random() * 5) })),
  }))
}

export const REAL_STAFF_DATA: Staff[] = [
  {
    id: 1,
    name: "尼古丁",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 1,
      },
    ],
  },
  {
    id: 2,
    name: "云吞面",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 1,
      },
      {
        id: "T0002",
        name: "售前外包项目0906940(SIOAYZ)",
        startDate: "2025-09-30",
        duration: 123,
        rowOffset: 2,
      },
      {
        id: "T0003",
        name: "平台杯雪番剧正片(SKCBPZ)",
        startDate: "2023-04-27",
        duration: 979,
        rowOffset: 3,
      },
      {
        id: "T0004",
        name: "手机端测试分店正片(WPPAPZ)",
        startDate: "2025-11-02",
        duration: 93,
        rowOffset: 4,
      },
      {
        id: "T0005",
        name: "手机端测试分店正片(WPPAPZ)",
        startDate: "2025-11-02",
        duration: 93,
        rowOffset: 5,
      },
    ],
  },
  {
    id: 3,
    name: "火龙果",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "售前外包项目0906940(SIOAYZ)",
        startDate: "2025-09-30",
        duration: 123,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 4,
    name: "三川",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "入账测试项目1010(YMLBYZ)",
        startDate: "2025-06-11",
        duration: 203,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 5,
    name: "洋鸽",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "入账测试项目1010(YMLBYZ)",
        startDate: "2025-06-11",
        duration: 203,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 6,
    name: "雾海",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "云顶新春2026(YXLAYZ)",
        startDate: "2025-08-22",
        duration: 146,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 7,
    name: "黄鱼",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "云顶新春2026(YXLAYZ)",
        startDate: "2025-08-22",
        duration: 146,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 8,
    name: "梨也",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 1,
      },
      {
        id: "T0002",
        name: "售前外包项目0906940(SIOAYZ)",
        startDate: "2025-09-30",
        duration: 123,
        rowOffset: 2,
      },
      {
        id: "T0003",
        name: "meizi外币项目(TYTBYZ)",
        startDate: "2025-06-17",
        duration: 185,
        rowOffset: 3,
      },
      {
        id: "T0004",
        name: "思彤预留款项目1015(WCRAYZ)",
        startDate: "2025-10-21",
        duration: 119,
        rowOffset: 4,
      },
      {
        id: "T0005",
        name: "jg外币项目1211(WQBAYZ)",
        startDate: "2025-11-07",
        duration: 118,
        rowOffset: 5,
      },
      {
        id: "T0006",
        name: "jg外币项目1211(WQBAYZ)",
        startDate: "2025-11-07",
        duration: 118,
        rowOffset: 6,
      },
    ],
  },
  {
    id: 9,
    name: "天天",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 1,
      },
      {
        id: "T0002",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 2,
      },
      {
        id: "T0003",
        name: "售前外包项目0906940(SIOAYZ)",
        startDate: "2025-09-30",
        duration: 123,
        rowOffset: 3,
      },
      {
        id: "T0004",
        name: "思彤预留款项目1015(WCRAYZ)",
        startDate: "2025-10-21",
        duration: 119,
        rowOffset: 4,
      },
      {
        id: "T0005",
        name: "手机端测试分店正片(WPPAPZ)",
        startDate: "2025-11-02",
        duration: 93,
        rowOffset: 5,
      },
      {
        id: "T0006",
        name: "手机端测试分店正片(WPPAPZ)",
        startDate: "2025-11-02",
        duration: 93,
        rowOffset: 6,
      },
      {
        id: "T0007",
        name: "WR告白气球CG(WRGAYZ)",
        startDate: "2025-12-02",
        duration: 61,
        rowOffset: 7,
      },
    ],
  },
  {
    id: 10,
    name: "大橡",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "mm政企项目1202(EMMAZZ)",
        startDate: "2025-12-16",
        duration: 15,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 1,
      },
    ],
  },
  {
    id: 11,
    name: "海里",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "Gaijin皮肤CG2(GJCAYZ)",
        startDate: "2025-09-16",
        duration: 185,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "入账测试项目1010(YMLBYZ)",
        startDate: "2025-06-11",
        duration: 203,
        rowOffset: 1,
      },
    ],
  },
  {
    id: 12,
    name: "丹子",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "平台杯雪番剧正片(SKCBPZ)",
        startDate: "2023-04-27",
        duration: 979,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 13,
    name: "瑀辰",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "平台杯雪番剧正片(SKCBPZ)",
        startDate: "2023-04-27",
        duration: 979,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 14,
    name: "飞龙",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "平台杯雪番剧正片(SKCBPZ)",
        startDate: "2023-04-27",
        duration: 979,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 15,
    name: "乔木",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "思彤预留款项目1015(WCRAYZ)",
        startDate: "2025-10-21",
        duration: 119,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 16,
    name: "老王",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "外币项目1113(WNNCYZ)",
        startDate: "2025-08-12",
        duration: 183,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 17,
    name: "博衍",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "WR告白气球CG(WRGAYZ)",
        startDate: "2025-12-02",
        duration: 61,
        rowOffset: 0,
      },
    ],
  },
  {
    id: 18,
    name: "灵犀",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "云顶新春2026(YXLAYZ)",
        startDate: "2025-08-22",
        duration: 146,
        rowOffset: 0,
      },
      {
        id: "T0001",
        name: "云顶新春2026(YXLAYZ)",
        startDate: "2025-08-22",
        duration: 146,
        rowOffset: 1,
      },
    ],
  },
  {
    id: 19,
    name: "坚果",
    avatar: Math.random() > 0.5 ? MOCK_STAFF_AVATAR_DATA[Math.floor(Math.random() * MOCK_STAFF_AVATAR_DATA.length)] : "",
    avatarColor: "bg-blue-100 text-blue-600",
    isCollapsed: false,
    tasks: [
      {
        id: "T0000",
        name: "云顶新春2026(YXLAYZ)",
        startDate: "2025-08-22",
        duration: 146,
        rowOffset: 0,
      },
    ],
  },
]
