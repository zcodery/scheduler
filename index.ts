import GanttScheduler from "./common/gantt-scheduler.vue"
export { GanttScheduler }
export * from "./GanttScheduler/types"
export * from "./GanttScheduler/utils/constants"

export const ResourceSchedulerPlugin = {
  install(Vue: any) {
    if (Vue && typeof Vue.component === "function") {
      Vue.component("gantt-scheduler", GanttScheduler)
    }
  },
}

export default GanttScheduler
