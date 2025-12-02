<template>
  <gantt-scheduler :readonly="readonly" :task="data" :title="title" :description="description" @data-change="onDataChange">
    <template #title>
      <h1 class="text-xl font-bold text-gray-900">{{ title }}</h1>
    </template>
    <template #description>
      <p class="text-xs text-gray-500 mt-1">{{ description }}</p>
    </template>
    <template #avatar="{ staff }">
      <img v-if="staff.avatar" :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <img v-else-if="staff.name == '王五'" src="/avatar.jpg" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <div v-else :class="staff.avatarColor" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">{{ staff.name.charAt(0) }}</div>
    </template>
    <template #workloadBar="{ staff }">
      <workload-bar :percentage="staff.workloadPercentage"></workload-bar>
    </template>
  </gantt-scheduler>
</template>

<script lang="ts">
import WorkloadBar from "@/components/WorkloadBar.vue"
import GanttScheduler from "../components/gantt-scheduler.vue"
import { MOCK_STAFF_DATA } from "../constants"

export default {
  components: { "gantt-scheduler": GanttScheduler, WorkloadBar },
  data() {
    const params = new URLSearchParams(window.location.search)
    const ro = params.get("readonly")
    const readonly = ro === "1" || ro === "true"
    let initialData = MOCK_STAFF_DATA
    try {
      const saved = localStorage.getItem("scheduler:data")
      if (saved) initialData = JSON.parse(saved)
    } catch {}
    return {
      title: "人员排期",
      description: "拖动图表滑动 • 双击编辑 • 右键管理",
      data: initialData,
      readonly,
    }
  },
  methods: {
    onDataChange(payload: any) {
      try {
        console.log(payload)
        localStorage.setItem("scheduler:data", JSON.stringify(payload))
      } catch {}
    },
  },
}
</script>

<style scoped></style>
