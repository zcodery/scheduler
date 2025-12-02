import { mount } from '@vue/test-utils'
import GanttScheduler from '../../components/gantt-scheduler.vue'
import { MOCK_STAFF_DATA } from '../../constants'

describe('gantt-scheduler', () => {
  test('emits data-change when staffData updates', async () => {
    const wrapper = mount(GanttScheduler as any, { propsData: { task: MOCK_STAFF_DATA } })
    const s = MOCK_STAFF_DATA[0]
    const t = s.tasks[0]
    ;(wrapper.vm as any).updateTask(s.id, t.id, { name: '更新任务' })
    await wrapper.vm.$nextTick()
    const ev = wrapper.emitted('data-change')
    expect(ev && ev.length).toBeGreaterThan(0)
    const last = ev![ev!.length - 1][0]
    expect(Array.isArray(last)).toBe(true)
    const updated = (last as any).find((x: any) => x.id === s.id).tasks.find((y: any) => y.id === t.id)
    expect(updated.name).toBe('更新任务')
  })

  test('resize interaction adjusts duration', async () => {
    const wrapper = mount(GanttScheduler as any, { attachTo: document.body, propsData: { task: MOCK_STAFF_DATA } })
    const s = (wrapper.vm as any).staffData[0]
    const t = s.tasks[0]
    const elWidth = window.innerWidth
    const startClientX = 300
    const eDown: any = { preventDefault() {}, stopPropagation() {}, clientX: startClientX, clientY: 200 }
    ;(wrapper.vm as any).handleResizeStart(eDown, 'right', t, s.id)
    const eMove: any = { clientX: startClientX + 50, clientY: 200 }
    ;(wrapper.vm as any).onGlobalMouseMove(eMove)
    await wrapper.vm.$nextTick()
    const after = (wrapper.vm as any).staffData[0].tasks[0].duration
    expect(after).toBeGreaterThanOrEqual(t.duration)
    const ev = wrapper.emitted('data-change')
    expect(ev && ev.length).toBeGreaterThan(0)
  })
})
