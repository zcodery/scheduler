import { mount } from '@vue/test-utils'
import GanttScheduler from '../../components/gantt-scheduler.vue'

function makeData(count: number) {
  const staffs = [] as any[]
  for (let i = 0; i < count; i++) {
    const tasks = [] as any[]
    for (let j = 0; j < 20; j++) {
      const start = new Date()
      start.setDate(start.getDate() + j)
      const y = start.getFullYear()
      const m = String(start.getMonth() + 1).padStart(2, '0')
      const d = String(start.getDate()).padStart(2, '0')
      tasks.push({ id: `T${i}-${j}`, name: `任务${i}-${j}`, startDate: `${y}-${m}-${d}`, duration: 3, rowOffset: j % 3 })
    }
    staffs.push({ id: String(i), name: `员工${i}`, role: '角色', avatarColor: 'bg-gray-100 text-gray-600', workloadPercentage: 50, tasks })
  }
  return staffs
}

describe('performance', () => {
  test('render 500 staffs within budget', async () => {
    const data = makeData(500)
    const start = Date.now()
    const wrapper = mount(GanttScheduler as any, { propsData: { task: data } })
    await wrapper.vm.$nextTick()
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(4000)
  })
})
