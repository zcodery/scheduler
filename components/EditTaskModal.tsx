import React, { useState, useEffect } from "react"
import { Task } from "../types"
import { DEFAULT_TASK_BG, DEFAULT_TASK_TEXT } from "../constants"

interface EditTaskModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSave: (taskId: string, updates: Partial<Task>) => void
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, task, onClose, onSave }) => {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [duration, setDuration] = useState(1)
  const [bgColor, setBgColor] = useState<string>("")
  const [textColor, setTextColor] = useState<string>("")

  // Helper: Add days to a date string
  const calculateEndDate = (start: string, dur: number) => {
    if (!start) return ""
    const d = new Date(start)
    d.setHours(0, 0, 0, 0)
    // Logic: End Date is the last active day. Visual duration 1 day = 24h.
    // If Start is 2023-10-01 and Duration is 1, End is 2023-10-01 (inclusive visual) or next day?
    // Standard scheduler logic: Start + Duration (days) - 1 day usually, but let's stick to Start + Duration for simple date math representing the "cutoff".
    d.setDate(d.getDate() + Math.round(dur))
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  // Helper: Diff between two date strings
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0
    const d1 = new Date(start)
    const d2 = new Date(end)
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    const diff = d2.getTime() - d1.getTime()
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
  }

  useEffect(() => {
    if (task) {
      setName(task.name)
      setStartDate(task.startDate)
      setDuration(task.duration)
      setEndDate(calculateEndDate(task.startDate, task.duration))
      setBgColor(task.bgColor ?? DEFAULT_TASK_BG)
      setTextColor(task.textColor ?? DEFAULT_TASK_TEXT)
    }
  }, [task])

  const handleStartDateChange = (val: string) => {
    setStartDate(val)
    if (duration > 0) {
      setEndDate(calculateEndDate(val, duration))
    }
  }

  const handleDurationChange = (val: number) => {
    setDuration(val)
    if (startDate) {
      setEndDate(calculateEndDate(startDate, val))
    }
  }

  const handleEndDateChange = (val: string) => {
    setEndDate(val)
    if (startDate) {
      setDuration(calculateDuration(startDate, val))
    }
  }

  if (!isOpen || !task) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(task.id, {
      name,
      startDate,
      duration: Number(duration),
      bgColor: bgColor || undefined,
      textColor: textColor || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">编辑任务</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">任务名称</label>
            <input type="text" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input type="date" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={startDate} onChange={e => handleStartDateChange(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input type="date" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={endDate} onChange={e => handleEndDateChange(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">背景色</label>
              <input type="color" className="w-full border border-gray-300 rounded p-0 text-sm h-10" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">文字颜色</label>
              <input type="color" className="w-full border border-gray-300 rounded p-0 text-sm h-10" value={textColor} onChange={e => setTextColor(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">工期 (天)</label>
            <input type="number" min="1" step="1" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={duration} onChange={e => handleDurationChange(Number(e.target.value))} />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
              取消
            </button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
