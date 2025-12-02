import { mount } from '@vue/test-utils'
import GanttScheduler from '../components/GanttScheduler.vue'
import { MOCK_STAFF_DATA } from '../constants'

describe('GanttScheduler', () => {
  it('renders with required task prop and shows title/description props', () => {
    const wrapper = mount(GanttScheduler as any, {
      propsData: { task: MOCK_STAFF_DATA, title: 'Custom Title', description: 'Custom Description' },
    })
    expect(wrapper.text()).toContain('Custom Title')
    expect(wrapper.text()).toContain('Custom Description')
  })

  it('emits data-change when a task is updated', async () => {
    const wrapper = mount(GanttScheduler as any, { propsData: { task: MOCK_STAFF_DATA } })
    const staff = MOCK_STAFF_DATA[0]
    const task = staff.tasks[0]
    wrapper.vm.updateTask(staff.id, task.id, { name: 'Updated' })
    await wrapper.vm.$nextTick()
    const emits = wrapper.emitted('data-change')
    expect(emits && emits.length).toBeGreaterThan(0)
    const payload = emits![emits!.length - 1][0]
    expect(Array.isArray(payload)).toBe(true)
  })

  it('renders title/description slots when provided', () => {
    const wrapper = mount(GanttScheduler as any, {
      propsData: { task: MOCK_STAFF_DATA },
      slots: {
        title: '<div data-test="slot-title">Slot Title</div>',
        description: '<div data-test="slot-desc">Slot Description</div>',
      },
    })
    expect(wrapper.find('[data-test="slot-title"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slot-desc"]').exists()).toBe(true)
  })

  it('projects avatar and workloadBar slots to StaffRow', () => {
    const wrapper = mount(GanttScheduler as any, {
      propsData: { task: MOCK_STAFF_DATA },
      slots: {
        avatar: '<span data-test="slot-avatar">A</span>',
        workloadBar: '<span data-test="slot-workload">W</span>',
      },
    })
    expect(wrapper.find('[data-test="slot-avatar"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="slot-workload"]').exists()).toBe(true)
  })
})
