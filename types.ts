export type ViewMode = "month" | "quarter" | "year"

export interface Task {
  id: string
  name: string
  startDate: string // YYYY-MM-DD
  duration: number // days
  rowOffset: number // visual vertical offset
  bgColor?: string
  textColor?: string
}

export interface Staff {
  id: string
  name: string
  role: string
  avatar?: string
  avatarColor: string
  workloadPercentage: number
  tasks: Task[]
  isCollapsed?: boolean
}

export interface DayInfo {
  date: Date
  label: string
  subLabel?: string
  isToday: boolean
  isWeekend?: boolean
}

export interface InteractionState {
  type: "resize" | "move"
  taskId: string
  staffId: string
  // For resize
  direction?: "left" | "right"
  initialDuration?: number
  // Common
  initialX: number
  initialY: number
  initialStartTime: number // ms
  // For move
  initialRowOffset?: number
  // Precise drag tracking
  offsetMs?: number
}

export interface TooltipState {
  visible: boolean
  x: number
  y: number
  startDate: string
  endDate: string
  duration: number
}

export interface EditTaskModalState {
  isOpen: boolean
  staffId: string
  task: Task | null
}

export interface EditStaffModalState {
  isOpen: boolean
  staff: Staff | null
}

export interface GanttSchedulerProps {
  readonly?: boolean
  task: Staff[]
  title?: string
  description?: string
}

export type GanttSchedulerDataChangePayload = Staff[]
