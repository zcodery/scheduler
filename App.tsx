import React, { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, UserPlus, Trash2, CalendarPlus, ChevronsLeft, ChevronsRight, Edit, Users, Lock } from "lucide-react"
import { MOCK_STAFF_DATA } from "./constants"
import { StaffRow } from "./components/StaffRow"
import { Staff, Task, ViewMode, DayInfo, InteractionState, EditTaskModalState, EditStaffModalState, TooltipState } from "./types"
import { EditTaskModal } from "./components/EditTaskModal"
import { EditStaffModal } from "./components/EditStaffModal"

interface AppProps {
  readonly?: boolean
  slots?: {
    title?: React.ReactNode
    description?: React.ReactNode
    avatar?: (staff: Staff) => React.ReactNode
  }
}

function App({ readonly = false, slots }: AppProps) {
  const [staffData, setStaffData] = useState<Staff[]>(MOCK_STAFF_DATA)
  const [viewStartDate, setViewStartDate] = useState(new Date().setHours(0, 0, 0, 0) - 86400000 * 2)
  const [viewMode, setViewMode] = useState<ViewMode>("month")

  // Unified Interaction State
  const [interaction, setInteraction] = useState<InteractionState | null>(null)

  // Real-time Tooltip State
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  // Modals
  const [editModal, setEditModal] = useState<EditTaskModalState>({ isOpen: false, staffId: "", task: null })
  const [editStaffModal, setEditStaffModal] = useState<EditStaffModalState>({ isOpen: false, staff: null })

  // Pan State
  const [isPanning, setIsPanning] = useState(false)
  const [panStartX, setPanStartX] = useState(0)
  const [panStartDate, setPanStartDate] = useState(0)

  // Auto Scroll Ref
  const autoScrollInterval = useRef<number | null>(null)
  const lastMouseX = useRef<number>(0)

  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Context Menu
  type ContextMenuType = "staff" | "task" | "row" | "general"
  interface ContextMenuState {
    x: number
    y: number
    type: ContextMenuType
    staffId?: string
    taskId?: string
  }
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  const ONE_DAY_MS = 86400000
  const SIDEBAR_WIDTH = 260

  const getViewDuration = () => {
    switch (viewMode) {
      case "month":
        return ONE_DAY_MS * 30
      case "quarter":
        return ONE_DAY_MS * 90
      case "year":
        return ONE_DAY_MS * 365
      default:
        return ONE_DAY_MS * 30
    }
  }
  const viewDurationMs = getViewDuration()

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  // --- Grid Headers Generation ---
  const getTimelineHeaders = (): DayInfo[] => {
    const headers: DayInfo[] = []
    const startDate = new Date(viewStartDate)
    const count = viewMode === "year" ? 12 : viewMode === "quarter" ? 13 : 31

    const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()

    const today = new Date()

    if (viewMode === "month") {
      const startDay = new Date(startDate)
      for (let i = 0; i < count; i++) {
        const d = new Date(startDay)
        d.setDate(d.getDate() + i)
        headers.push({
          date: d,
          label: `${d.getDate()}`,
          subLabel: ["日", "一", "二", "三", "四", "五", "六"][d.getDay()],
          isToday: isSameDay(d, today),
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
        })
      }
    } else if (viewMode === "quarter") {
      const startDay = new Date(startDate)
      for (let i = 0; i < count; i++) {
        const d = new Date(startDay)
        d.setDate(d.getDate() + i * 7)
        headers.push({
          date: d,
          label: `W${Math.ceil(d.getDate() / 7)}`,
          subLabel: `${d.getMonth() + 1}/${d.getDate()}`,
          isToday: false,
          isWeekend: false,
        })
      }
    } else {
      const startDay = new Date(startDate)
      for (let i = 0; i < count; i++) {
        const d = new Date(startDay)
        d.setMonth(d.getMonth() + i)
        headers.push({
          date: d,
          label: `${d.getMonth() + 1}月`,
          subLabel: `${d.getFullYear()}`,
          isToday: d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear(),
          isWeekend: false,
        })
      }
    }
    return headers
  }
  const headers = getTimelineHeaders()

  // --- Quick Jump Logic ---
  const getQuickJumpDirection = (): "left" | "right" | null => {
    let minTaskStart = Infinity
    let maxTaskEnd = -Infinity
    let hasTasks = false

    staffData.forEach(s => {
      s.tasks.forEach(t => {
        hasTasks = true
        const start = new Date(t.startDate).getTime()
        const end = start + t.duration * ONE_DAY_MS
        if (start < minTaskStart) minTaskStart = start
        if (end > maxTaskEnd) maxTaskEnd = end
      })
    })

    if (!hasTasks) return null

    const viewEnd = viewStartDate + viewDurationMs
    if (maxTaskEnd < viewStartDate) return "left"
    if (minTaskStart > viewEnd) return "right"

    return null
  }

  const jumpToData = (direction: "left" | "right") => {
    let minTaskStart = Infinity
    staffData.forEach(s => {
      s.tasks.forEach(t => {
        const start = new Date(t.startDate).getTime()
        if (start < minTaskStart) minTaskStart = start
      })
    })
    if (minTaskStart === Infinity) minTaskStart = new Date().getTime()
    setViewStartDate(minTaskStart - viewDurationMs * 0.1)
  }
  const quickJumpDir = getQuickJumpDirection()

  // --- Helper: Date at Mouse ---
  // Calculates the specific time on the timeline under the mouse cursor
  const getDateAtMouse = (clientX: number): number => {
    const timelineWidth = Math.max(1, window.innerWidth - SIDEBAR_WIDTH)
    const msPerPixel = viewDurationMs / timelineWidth
    const relativeX = clientX - SIDEBAR_WIDTH
    return viewStartDate + relativeX * msPerPixel
  }

  // --- Auto Scroll Logic ---
  const stopAutoScroll = () => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current)
      autoScrollInterval.current = null
    }
  }

  const startAutoScroll = (direction: "left" | "right") => {
    if (autoScrollInterval.current) return

    autoScrollInterval.current = window.setInterval(() => {
      const shift = direction === "left" ? -1 : 1
      const speed = viewDurationMs * 0.005 // 0.5% per frame
      setViewStartDate(prev => prev + speed * shift)
      // Force an update call to keep dragging logic in sync with new viewStartDate
    }, 16)
  }

  // --- Handlers ---

  const handleResizeStart = (e: React.MouseEvent, direction: "left" | "right", task: Task, staffId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return
    const taskStartMs = new Date(task.startDate).getTime()
    const mouseTime = getDateAtMouse(e.clientX)

    setInteraction({
      type: "resize",
      taskId: task.id,
      staffId,
      direction,
      initialX: e.clientX,
      initialY: e.clientY,
      initialStartTime: taskStartMs,
      initialDuration: task.duration,
      offsetMs: taskStartMs - mouseTime, // Not used for resize as much but good for consistency
    })

    document.body.classList.add(direction === "left" ? "resizing-left" : "resizing-right")
  }

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, staffId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (readonly) return

    const taskStartMs = new Date(task.startDate).getTime()
    const mouseTime = getDateAtMouse(e.clientX)

    // Store precise offset: Task Time minus Mouse Time
    // When mouse moves, Task Time = New Mouse Time + Offset
    const offsetMs = taskStartMs - mouseTime

    setInteraction({
      type: "move",
      taskId: task.id,
      staffId,
      initialX: e.clientX,
      initialY: e.clientY,
      initialStartTime: taskStartMs,
      initialRowOffset: task.rowOffset,
      offsetMs,
    })
    document.body.style.cursor = "move"
  }

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    lastMouseX.current = e.clientX
    const timelineWidth = Math.max(1, window.innerWidth - SIDEBAR_WIDTH)
    const msPerPixel = viewDurationMs / timelineWidth

    // Auto Scroll Triggers
    if (interaction) {
      const edgeThreshold = 60
      if (e.clientX < SIDEBAR_WIDTH + edgeThreshold) {
        startAutoScroll("left")
      } else if (e.clientX > window.innerWidth - edgeThreshold) {
        startAutoScroll("right")
      } else {
        stopAutoScroll()
      }
    }

    if (interaction) {
      // Common: Find task
      const staffIndex = staffData.findIndex(s => s.id === interaction.staffId)
      if (staffIndex === -1) return
      const tasks = [...staffData[staffIndex].tasks]
      const taskIndex = tasks.findIndex(t => t.id === interaction.taskId)
      if (taskIndex === -1) return
      const currentTask = tasks[taskIndex]

      // Current exact time under mouse (accounts for scrolling)
      const currentMouseTime = getDateAtMouse(e.clientX)

      // -- RESIZING --
      if (interaction.type === "resize" && interaction.initialDuration !== undefined) {
        // Calculate days difference based on X movement
        const deltaX = e.clientX - interaction.initialX
        const deltaDays = (deltaX * msPerPixel) / ONE_DAY_MS

        let newDuration = currentTask.duration
        let newStartDate = currentTask.startDate

        if (interaction.direction === "right") {
          const rawNewDuration = interaction.initialDuration + deltaDays
          newDuration = Math.max(1, Math.round(rawNewDuration))
        } else {
          // Left resize: Start Date changes, Duration changes
          const rawShiftDays = Math.round(deltaDays)
          newDuration = Math.max(1, interaction.initialDuration - rawShiftDays)

          if (newDuration !== currentTask.duration) {
            // Only update start date if duration changed by integer amount
            const shiftMs = (interaction.initialDuration - newDuration) * ONE_DAY_MS
            // But wait, left resize means dragging start point.
            // Easier logic: New Start = Initial Start + Delta
            const newStartMs = interaction.initialStartTime + deltaDays * ONE_DAY_MS
            // Snap to 00:00
            const d = new Date(newStartMs)
            d.setHours(0, 0, 0, 0)
            const y = d.getFullYear()
            const m = String(d.getMonth() + 1).padStart(2, "0")
            const day = String(d.getDate()).padStart(2, "0")
            newStartDate = `${y}-${m}-${day}`
          }
        }

        // Update data
        const newStaffData = [...staffData]
        newStaffData[staffIndex].tasks[taskIndex] = {
          ...currentTask,
          duration: newDuration,
          startDate: newStartDate,
        }
        setStaffData(newStaffData)

        // Update Tooltip
        // Calculate End Date for display
        const dStart = new Date(newStartDate)
        const dEnd = new Date(dStart)
        dEnd.setDate(dEnd.getDate() + newDuration)
        const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth() + 1).padStart(2, "0")}-${String(dEnd.getDate()).padStart(2, "0")}`

        setTooltip({
          visible: true,
          x: e.clientX + 15,
          y: e.clientY + 15,
          startDate: newStartDate,
          endDate: endStr,
          duration: newDuration,
        })
        return
      }

      // -- MOVING --
      if (interaction.type === "move" && interaction.initialRowOffset !== undefined && interaction.offsetMs !== undefined) {
        // New Start Time = Current Mouse Time + Initial Offset
        let newStartMs = currentMouseTime + interaction.offsetMs

        // Snap to integer day (00:00:00)
        const d = new Date(newStartMs)
        // Rounding to nearest day to make snapping feel better
        if (d.getHours() >= 12) d.setDate(d.getDate() + 1)
        d.setHours(0, 0, 0, 0)

        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, "0")
        const day = String(d.getDate()).padStart(2, "0")
        const dateStr = `${y}-${m}-${day}`

        const deltaY = e.clientY - interaction.initialY
        const rowShift = Math.round(deltaY / 36)
        const newRowOffset = Math.max(0, interaction.initialRowOffset + rowShift)

        // Handle Cross-Staff Drag
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY)
        const staffRowEl = elementUnderMouse?.closest("[data-staff-id]")
        const targetStaffId = staffRowEl?.getAttribute("data-staff-id")

        const newStaffData = [...staffData]

        // Find where the task currently is (might have moved in previous frame)
        let currentStaffIdx = newStaffData.findIndex(s => s.tasks.find(t => t.id === interaction.taskId))
        if (currentStaffIdx !== -1) {
          let taskToMove = newStaffData[currentStaffIdx].tasks.find(t => t.id === interaction.taskId)!

          // If we are over a different staff, move it
          if (targetStaffId && targetStaffId !== newStaffData[currentStaffIdx].id) {
            const targetStaffIdx = newStaffData.findIndex(s => s.id === targetStaffId)
            if (targetStaffIdx !== -1) {
              // Remove from old
              newStaffData[currentStaffIdx].tasks = newStaffData[currentStaffIdx].tasks.filter(t => t.id !== taskToMove.id)
              // Update task props
              taskToMove = { ...taskToMove, startDate: dateStr, rowOffset: newRowOffset }
              // Add to new
              newStaffData[targetStaffIdx].tasks.push(taskToMove)
              // Update Interaction Staff ID tracking
              setInteraction(prev => (prev ? { ...prev, staffId: targetStaffId } : null))
            }
          } else {
            // Same staff update
            newStaffData[currentStaffIdx].tasks = newStaffData[currentStaffIdx].tasks.map(t => (t.id === taskToMove.id ? { ...t, startDate: dateStr, rowOffset: newRowOffset } : t))
          }
          setStaffData(newStaffData)

          // Tooltip Update
          const dEnd = new Date(d)
          dEnd.setDate(dEnd.getDate() + taskToMove.duration)
          const endStr = `${dEnd.getFullYear()}-${String(dEnd.getMonth() + 1).padStart(2, "0")}-${String(dEnd.getDate()).padStart(2, "0")}`

          setTooltip({
            visible: true,
            x: e.clientX + 15,
            y: e.clientY + 15,
            startDate: dateStr,
            endDate: endStr,
            duration: taskToMove.duration,
          })
        }
      }
      return
    }

    // 2. Panning Logic
    if (isPanning) {
      const deltaX = e.clientX - panStartX
      setViewStartDate(panStartDate - deltaX * msPerPixel)
    }
  }

  const handleGlobalMouseUp = () => {
    stopAutoScroll()
    if (interaction) {
      setInteraction(null)
      setTooltip(null)
      document.body.classList.remove("resizing-left", "resizing-right")
      document.body.style.cursor = ""
    }
    if (isPanning) {
      setIsPanning(false)
      document.body.style.cursor = ""
    }
  }

  const handleStaffDragStart = (e: React.DragEvent, staffId: string) => {
    e.dataTransfer.setData("type", "staff")
    e.dataTransfer.setData("staffId", staffId)
    e.dataTransfer.effectAllowed = "move"
    // Create a ghost image if needed, browser does default
  }

  // Ref for currently dragged staff to support DragEnter sorting
  const draggedStaffIdRef = useRef<string | null>(null)

  const handleStaffDragStartWithRef = (e: React.DragEvent, staffId: string) => {
    draggedStaffIdRef.current = staffId
    handleStaffDragStart(e, staffId)
  }

  const handleStaffLiveSort = (e: React.DragEvent, targetStaffId: string) => {
    const sourceId = draggedStaffIdRef.current
    if (!sourceId || sourceId === targetStaffId) return

    const sourceIndex = staffData.findIndex(s => s.id === sourceId)
    const targetIndex = staffData.findIndex(s => s.id === targetStaffId)

    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newData = [...staffData]
      const [moved] = newData.splice(sourceIndex, 1)
      newData.splice(targetIndex, 0, moved)
      setStaffData(newData)
    }
  }

  const handleStaffDrop = (e: React.DragEvent, targetStaffId: string) => {
    draggedStaffIdRef.current = null
  }

  const handleContextMenu = (e: React.MouseEvent, type: ContextMenuType, staff?: Staff, task?: Task) => {
    e.preventDefault()
    if (!containerRef.current) return
    if (readonly) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left + containerRef.current.scrollLeft
    const y = e.clientY - containerRect.top + containerRef.current.scrollTop

    setContextMenu({ x, y, type, staffId: staff?.id, taskId: task?.id })
  }

  const handlePanMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || interaction) return
    if (e.clientX < SIDEBAR_WIDTH) return // Sidebar check

    if ((e.target as HTMLElement).closest(".task-card")) return
    if ((e.target as HTMLElement).closest("input")) return

    setIsPanning(true)
    setPanStartX(e.clientX)
    setPanStartDate(viewStartDate)
    document.body.style.cursor = "grabbing"
  }

  // --- CRUD & Updates ---

  const addStaff = () => {
    if (readonly) return
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: "新员工",
      role: "职位待定",
      avatarColor: "bg-gray-200 text-gray-600",
      workloadPercentage: 0,
      tasks: [],
      isCollapsed: false,
    }
    setStaffData([...staffData, newStaff])
    setContextMenu(null)
  }

  const deleteStaff = (id: string) => {
    if (readonly) return
    setStaffData(staffData.filter(s => s.id !== id))
    setContextMenu(null)
  }

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    if (readonly) return
    setStaffData(staffData.map(s => (s.id === id ? { ...s, ...updates } : s)))
  }

  const addTask = (staffId: string) => {
    if (readonly) return
    const taskStartMs = viewStartDate + viewDurationMs * 0.1
    const d = new Date(taskStartMs)
    d.setHours(0, 0, 0, 0)
    const newDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

    setStaffData(prev =>
      prev.map(s => {
        if (s.id === staffId) {
          const maxRow = s.tasks.length > 0 ? Math.max(...s.tasks.map(t => t.rowOffset)) : -1
          const newTask: Task = {
            id: `T${Date.now().toString().slice(-4)}`,
            name: "新任务",
            startDate: newDateStr,
            duration: 3,
            rowOffset: maxRow + 1,
          }
          return { ...s, tasks: [...s.tasks, newTask] }
        }
        return s
      })
    )
    setContextMenu(null)
  }

  const deleteTask = (staffId: string, taskId: string) => {
    if (readonly) return
    setStaffData(
      staffData.map(s => {
        if (s.id === staffId) {
          return { ...s, tasks: s.tasks.filter(t => t.id !== taskId) }
        }
        return s
      })
    )
    setContextMenu(null)
  }

  const updateTask = (staffId: string, taskId: string, updates: Partial<Task>) => {
    if (readonly) return
    setStaffData(
      staffData.map(s => {
        if (s.id === staffId) {
          return {
            ...s,
            tasks: s.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t)),
          }
        }
        return s
      })
    )
  }

  const openEditModal = () => {
    if (readonly) return
    if (contextMenu?.staffId && contextMenu?.taskId) {
      const staff = staffData.find(s => s.id === contextMenu.staffId)
      const task = staff?.tasks.find(t => t.id === contextMenu.taskId)
      if (staff && task) {
        setEditModal({ isOpen: true, staffId: staff.id, task })
        setContextMenu(null)
      }
    }
  }

  const openEditStaffModal = () => {
    if (readonly) return
    if (contextMenu?.staffId) {
      const staff = staffData.find(s => s.id === contextMenu.staffId)
      if (staff) {
        setEditStaffModal({ isOpen: true, staff })
        setContextMenu(null)
      }
    }
  }

  const toggleCollapse = (id: string) => {
    if (readonly) return
    setStaffData(staffData.map(s => (s.id === id ? { ...s, isCollapsed: !s.isCollapsed } : s)))
  }

  const handleDateNav = (direction: "prev" | "next") => {
    const shift = direction === "next" ? 1 : -1
    let shiftMs = 0
    if (viewMode === "month") shiftMs = ONE_DAY_MS * 30 * shift
    else if (viewMode === "quarter") shiftMs = ONE_DAY_MS * 90 * shift
    else shiftMs = ONE_DAY_MS * 365 * shift
    setViewStartDate(prev => prev + shiftMs)
  }

  const currentDateObj = new Date(viewStartDate)
  const currentLabel = `${currentDateObj.getFullYear()}年 ${currentDateObj.getMonth() + 1}月`

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col select-none h-screen overflow-hidden" onMouseMove={handleGlobalMouseMove} onMouseUp={handleGlobalMouseUp} onMouseLeave={handleGlobalMouseUp}>
      <EditTaskModal isOpen={editModal.isOpen} task={editModal.task} onClose={() => setEditModal({ ...editModal, isOpen: false })} onSave={(taskId, updates) => updateTask(editModal.staffId, taskId, updates)} />

      <EditStaffModal isOpen={editStaffModal.isOpen} staff={editStaffModal.staff} onClose={() => setEditStaffModal({ ...editStaffModal, isOpen: false })} onSave={(staffId, updates) => updateStaff(staffId, updates)} />

      {/* Global Realtime Tooltip */}
      {tooltip && tooltip.visible && (
        <div className="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1.5 rounded shadow-lg pointer-events-none space-y-0.5" style={{ left: tooltip.x, top: tooltip.y }}>
          <div>开始: {tooltip.startDate}</div>
          <div>结束: {tooltip.endDate}</div>
          <div>工期: {tooltip.duration} 天</div>
        </div>
      )}

      {/* Top Controls */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-50 relative shadow-sm shrink-0">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{slots?.title ?? "人员排期"}</h1>
          <p className="text-xs text-gray-500 mt-1">{slots?.description ?? "拖动图表滑动 • 拖拽任务任意移动 • 左右边界自动滚屏 • 双击编辑 • 右键管理"}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {(["month", "quarter", "year"] as ViewMode[]).map(mode => (
              <button key={mode} onClick={() => setViewMode(mode)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === mode ? "bg-white shadow text-indigo-600" : "text-gray-500 hover:text-gray-900"}`}>
                {mode === "month" ? "月" : mode === "quarter" ? "季" : "年"}视图
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1 shadow-sm">
            <button onClick={() => handleDateNav("prev")} className="p-1 hover:bg-gray-50 rounded text-gray-500">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">{currentLabel}</span>
            <button onClick={() => handleDateNav("next")} className="p-1 hover:bg-gray-50 rounded text-gray-500">
              <ChevronRight size={16} />
            </button>
          </div>

          {readonly && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded">
              <Lock size={14} />
              只读模式
            </span>
          )}
        </div>
      </div>

      {/* Main Scrollable Area */}
      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden relative ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
        onMouseDown={handlePanMouseDown}
        onContextMenu={e => {
          if (e.target === e.currentTarget || (e.target as HTMLElement).closest(".header-row")) {
            handleContextMenu(e, "general")
          }
        }}
      >
        {/* Sticky Header Row */}
        <div className="sticky top-0 z-40 flex border-b border-gray-200 bg-gray-50 shadow-sm header-row">
          <div className="w-64 flex-shrink-0 p-3 border-r border-gray-200 text-xs font-semibold text-gray-500 flex items-center bg-gray-50">人员 / 饱和度</div>
          <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
            {headers.map((h, i) => (
              <div key={i} className={`flex flex-col items-center justify-center py-2 border-r border-gray-200 text-xs ${h.isToday ? "bg-blue-100/50" : h.isWeekend ? "bg-gray-200/50" : ""}`}>
                <span className={`font-medium whitespace-nowrap ${h.isToday ? "text-blue-600" : "text-gray-700"}`}>{h.label}</span>
                <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{h.subLabel}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Rows */}
        <div className="relative">
          {staffData.map(staff => (
            <StaffRow key={staff.id} staff={staff} headers={headers} viewStartDate={new Date(viewStartDate)} viewDurationMs={viewDurationMs} viewMode={viewMode} readonly={readonly} renderAvatar={slots?.avatar} onStaffDragStart={handleStaffDragStartWithRef} onStaffDragEnter={handleStaffLiveSort} onStaffDrop={handleStaffDrop} onContextMenu={handleContextMenu} onToggleCollapse={toggleCollapse} onTaskUpdate={updateTask} onResizeStart={handleResizeStart} onTaskMouseDown={handleTaskMouseDown} onStaffUpdate={updateStaff} />
          ))}

          {quickJumpDir && (
            <div className="absolute top-1/2 -translate-y-1/2 z-50 pointer-events-none w-full flex justify-between px-10 pl-[280px]">
              {quickJumpDir === "left" && (
                <button className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 pointer-events-auto animate-bounce" onClick={() => jumpToData("left")} title="跳转到左侧数据">
                  <ChevronsLeft size={24} />
                </button>
              )}
              <div className="flex-1"></div>
              {quickJumpDir === "right" && (
                <button className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 pointer-events-auto animate-bounce" onClick={() => jumpToData("right")} title="跳转到右侧数据">
                  <ChevronsRight size={24} />
                </button>
              )}
            </div>
          )}

          <div className="h-[300px]" onClick={() => setContextMenu(null)}></div>
        </div>

        {/* Context Menu */}
        {contextMenu && (
          <div ref={contextMenuRef} className="absolute bg-white border border-gray-200 shadow-xl rounded-lg py-1 z-[100] w-48 text-sm" style={{ top: contextMenu.y, left: contextMenu.x }}>
            {contextMenu.type === "general" && (
              <button onClick={addStaff} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex items-center gap-2">
                <UserPlus size={14} />
                <span>新增人员</span>
              </button>
            )}

            {(contextMenu.type === "staff" || contextMenu.type === "row") && contextMenu.staffId && (
              <>
                <button onClick={() => contextMenu.staffId && addTask(contextMenu.staffId)} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex items-center gap-2">
                  <CalendarPlus size={14} />
                  <span>新增任务</span>
                </button>

                <button onClick={openEditStaffModal} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex items-center gap-2">
                  <Users size={14} />
                  <span>编辑人员信息</span>
                </button>

                <div className="h-px bg-gray-100 my-1"></div>

                <button onClick={() => contextMenu.staffId && deleteStaff(contextMenu.staffId)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                  <Trash2 size={14} />
                  <span>删除该人员</span>
                </button>
              </>
            )}

            {contextMenu.type === "task" && (
              <>
                <button onClick={openEditModal} className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-gray-700 flex items-center gap-2">
                  <Edit size={14} />
                  <span>编辑任务</span>
                </button>

                <div className="h-px bg-gray-100 my-1"></div>

                <button onClick={() => contextMenu.staffId && contextMenu.taskId && deleteTask(contextMenu.staffId, contextMenu.taskId)} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                  <Trash2 size={14} />
                  <span>删除任务</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
