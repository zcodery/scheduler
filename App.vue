<template>
  <gantt-scheduler :readonly="readonly" :task="staffData">
    <template #title>
      <h1 class="text-xl font-bold text-gray-900">人员排期</h1>
    </template>
    <template #description>
      <p class="text-xs text-gray-500 mt-1">拖动图表滑动 • 双击编辑 • 右键管理</p>
    </template>
  </gantt-scheduler>
</template>

<script lang="ts">
import { Staff } from "./types"
import { MOCK_STAFF_DATA } from "./constants"
import GanttScheduler from "./components/GanttScheduler.vue"

export default {
  components: { GanttScheduler },
  props: { readonly: { type: Boolean, required: false, default: false } },
  data() {
    return { staffData: MOCK_STAFF_DATA as Staff[] }
  },
}
</script>

<style scoped></style>
