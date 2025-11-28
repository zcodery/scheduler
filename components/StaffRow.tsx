import React, { useState } from "react"
import { Staff, Task, DayInfo, ViewMode } from "../types"
import { TaskCard } from "./TaskCard"
import { WorkloadBar } from "./WorkloadBar"
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react"

interface StaffRowProps {
  staff: Staff
  headers: DayInfo[]
  viewStartDate: Date
  viewDurationMs: number
  viewMode: ViewMode
  readonly?: boolean
  renderAvatar?: (staff: Staff) => React.ReactNode
  onStaffDragStart: (e: React.DragEvent, staffId: string) => void
  onStaffDragEnter: (e: React.DragEvent, targetStaffId: string) => void // New: Live sort
  onStaffDrop: (e: React.DragEvent, targetStaffId: string) => void
  onContextMenu: (e: React.MouseEvent, type: "staff" | "task" | "row", staff: Staff, task?: Task) => void
  onToggleCollapse: (staffId: string) => void
  onTaskUpdate: (staffId: string, taskId: string, updates: Partial<Task>) => void
  onResizeStart: (e: React.MouseEvent, direction: "left" | "right", task: Task, staffId: string) => void
  onTaskMouseDown: (e: React.MouseEvent, task: Task, staffId: string) => void
  onStaffUpdate: (staffId: string, updates: Partial<Staff>) => void
}

export const StaffRow: React.FC<StaffRowProps> = ({ staff, headers, viewStartDate, viewDurationMs, viewMode, readonly, renderAvatar, onStaffDragStart, onStaffDragEnter, onStaffDrop, onContextMenu, onToggleCollapse, onTaskUpdate, onResizeStart, onTaskMouseDown, onStaffUpdate }) => {
  const [editingField, setEditingField] = useState<"name" | "role" | null>(null)

  // Determine row height
  const maxRowIndex = staff.tasks.length > 0 ? Math.max(...staff.tasks.map(t => t.rowOffset)) : 0
  const rowHeightClass = staff.isCollapsed ? "h-16" : `min-h-[128px]`
  const dynamicHeight = staff.isCollapsed ? {} : { height: `${Math.max(128, (maxRowIndex + 2) * 36 + 20)}px` }

  // Staff Reordering Handlers
  const handleStaffDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // Stop bubbling to prevent parent interference
  }

  // Use DragEnter for Live Sorting (swapping as you drag)
  const handleStaffDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation() // Stop bubbling to prevent rapid-fire events on children
    onStaffDragEnter(e, staff.id)
  }

  const handleStaffDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onStaffDrop(e, staff.id)
  }

  const cycleAvatarColor = () => {
    // Only cycle color if using the default avatar (no image)
    if (staff.avatar) return

    const colors = ["bg-blue-100 text-blue-600", "bg-emerald-100 text-emerald-600", "bg-purple-100 text-purple-600", "bg-orange-100 text-orange-600", "bg-rose-100 text-rose-600", "bg-indigo-100 text-indigo-600"]
    const currentIdx = colors.indexOf(staff.avatarColor)
    const nextColor = colors[(currentIdx + 1) % colors.length]
    onStaffUpdate(staff.id, { avatarColor: nextColor })
  }

  return (
    <div data-staff-id={staff.id} className={`flex border-b border-gray-100 bg-white transition-all duration-300 ease-in-out ${rowHeightClass}`} style={dynamicHeight}>
      {/* Left Column: Staff Info */}
      <div className="w-64 flex-shrink-0 p-4 border-r border-gray-200 flex flex-col justify-center select-none bg-white relative group z-20 transition-colors hover:bg-gray-50/50" onContextMenu={e => onContextMenu(e, "staff", staff)} onDragOver={handleStaffDragOver} onDragEnter={handleStaffDragEnter} onDrop={handleStaffDrop}>
        <div
          className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-300 cursor-grab hover:text-gray-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          draggable
          onDragStart={e => {
            e.stopPropagation()
            if (!readonly) onStaffDragStart(e, staff.id)
          }} // Stop prop to keep drag clean
        >
          <GripVertical size={16} />
        </div>

        <div className="flex items-center gap-3 pl-4">
          <button
            onClick={e => {
              e.stopPropagation()
              onToggleCollapse(staff.id)
            }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
          >
            {staff.isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>

          {/* Avatar Logic */}
          {renderAvatar ? (
            <>{renderAvatar(staff)}</>
          ) : staff.avatar ? (
            <img src={staff.avatar} alt={staff.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${staff.avatarColor} cursor-pointer hover:ring-2 ring-offset-1 ring-indigo-200 flex-shrink-0 select-none`}
              onClick={() => {
                if (!readonly) cycleAvatarColor()
              }}
              title="点击切换颜色"
            >
              {staff.name.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            {editingField === "name" ? (
              <input
                autoFocus
                className="w-full text-sm font-bold border rounded px-1"
                defaultValue={staff.name}
                onBlur={e => {
                  if (!readonly && e.target.value.trim()) onStaffUpdate(staff.id, { name: e.target.value })
                  setEditingField(null)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") e.currentTarget.blur()
                }}
              />
            ) : (
              <div
                className="text-sm font-bold text-gray-900 truncate cursor-text hover:text-indigo-600"
                onDoubleClick={() => {
                  if (!readonly) setEditingField("name")
                }}
                title="双击编辑"
              >
                {staff.name}
              </div>
            )}

            {editingField === "role" ? (
              <input
                autoFocus
                className="w-full text-xs text-gray-500 border rounded px-1"
                defaultValue={staff.role}
                onBlur={e => {
                  if (!readonly && e.target.value.trim()) onStaffUpdate(staff.id, { role: e.target.value })
                  setEditingField(null)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") e.currentTarget.blur()
                }}
              />
            ) : (
              <div
                className="text-xs text-gray-500 truncate cursor-text hover:text-indigo-600"
                onDoubleClick={() => {
                  if (!readonly) setEditingField("role")
                }}
                title="双击编辑"
              >
                {staff.role}
              </div>
            )}
          </div>
        </div>
        {!staff.isCollapsed && <WorkloadBar percentage={staff.workloadPercentage} />}
      </div>

      {/* Right Column: Timeline Grid */}
      <div
        className="flex-1 relative overflow-hidden bg-white"
        onContextMenu={e => {
          if ((e.target as HTMLElement).closest(".task-card")) return
          onContextMenu(e, "row", staff)
        }}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
          {headers.map((h, i) => (
            <div key={i} className={`border-r border-gray-100 h-full ${h.isToday ? "bg-blue-50/60" : h.isWeekend ? "bg-gray-50/80" : ""}`} />
          ))}
        </div>

        {/* Tasks Layer */}
        {!staff.isCollapsed && (
          <div className="relative w-full h-full pt-3 pb-2">
            {staff.tasks.map(task => {
              const taskStart = new Date(task.startDate).getTime()
              const startOffset = taskStart - viewStartDate.getTime()
              const durationMs = task.duration * 86400000

              let left = (startOffset / viewDurationMs) * 100
              let width = (durationMs / viewDurationMs) * 100

              if (left + width < -50 || left > 150) return null

              const topOffset = (task.rowOffset || 0) * 36

              return (
                <div
                  key={task.id}
                  className="absolute z-10"
                  style={{
                    left: `${parseInt(`${left}`)}%`,
                    width: `${Math.max(width, 0.5)}%`,
                    top: `${12 + topOffset}px`,
                  }}
                >
                  <TaskCard task={task} viewMode={viewMode} readonly={readonly} onMouseDown={e => onTaskMouseDown(e, task, staff.id)} onContextMenu={e => onContextMenu(e, "task", staff, task)} onUpdate={newName => onTaskUpdate(staff.id, task.id, { name: newName })} onResizeStart={(e, dir, t) => onResizeStart(e, dir, t, staff.id)} />
                </div>
              )
            })}
          </div>
        )}

        {/* Collapsed Summary */}
        {staff.isCollapsed && staff.tasks.length > 0 && (
          <div className="absolute inset-0 flex items-center px-2">
            <span className="ml-2 text-xs text-gray-400 whitespace-nowrap bg-white/80 px-2 rounded-full border border-gray-200">{staff.tasks.length} 任务</span>
          </div>
        )}
      </div>
    </div>
  )
}
