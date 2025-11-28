import React, { useState, useEffect } from "react"
import { Staff } from "../types"
import { PRESET_AVATAR_COLORS } from "../constants"
import { ColorPresetPicker } from "./ColorPresetPicker"

interface EditStaffModalProps {
  isOpen: boolean
  staff: Staff | null
  onClose: () => void
  onSave: (staffId: string, updates: Partial<Staff>) => void
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ isOpen, staff, onClose, onSave }) => {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [workload, setWorkload] = useState(0)
  const [avatarColor, setAvatarColor] = useState("")

  useEffect(() => {
    if (staff) {
      setName(staff.name)
      setRole(staff.role)
      setWorkload(staff.workloadPercentage)
      setAvatarColor(staff.avatarColor)
    }
  }, [staff])

  if (!isOpen || !staff) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(staff.id, {
      name,
      role,
      workloadPercentage: Number(workload),
      avatarColor,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-96 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">编辑人员信息</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
            <input type="text" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">职位</label>
            <input type="text" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" value={role} onChange={e => setRole(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">头像颜色</label>
            <ColorPresetPicker colors={PRESET_AVATAR_COLORS} selectedKey={avatarColor} onSelect={c => setAvatarColor(c.class || "")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">本周负荷 (%)</label>
            <input type="number" required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-300" value={workload} onChange={e => setWorkload(Number(e.target.value))} />
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
