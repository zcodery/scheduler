<template>
  <gantt-scheduler :readonly="readonly" :task="payload" :title="title" :description="description" :staffConfig="staffConfig" @data-change="onDataChange">
    <!-- <template #avatar="{ staff }">
      <img v-if="staff.avatar" :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <img v-else-if="staff.name == '王五'" src="/avatar.jpg" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <div v-else :class="staff.avatarColor" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">{{ staff.name.charAt(0) }}</div>
    </template> -->
    <template #workloadBar="{ staff }">
      <workload-bar :percentage="staff.workloadPercentage"></workload-bar>
    </template>
    <template #extra>
      <el-button v-if="!readonly" size="mini" type="success" :icon="withdynamicIcon" @click="onSave" :loading="loading">保存</el-button>
      <el-switch size="mini" v-model="readonly" active-color="#13ce66" inactive-color="#409eff" :active-text="readonly ? '只读模式' : '编辑模式'"></el-switch>
    </template>
  </gantt-scheduler>
</template>

<script lang="ts">
import WorkloadBar from "@/pages/components/WorkloadBar.vue"
import GanttScheduler from "../common/gantt-scheduler.vue"
import { MOCK_STAFF_DATA } from "./database/gantt"

export default {
  components: { "gantt-scheduler": GanttScheduler, WorkloadBar },
  data() {
    return {
      title: "人员排期",
      description: "拖动图表滑动 • 双击编辑 • 右键管理",
      readonly: false,
      payload: [],
      withdynamicIcon: "",
      loading: false,
      staffConfig: [
        { prop: "role", label: "职位", type: "picker", component: "el-select", params: { placeholder: "选择职位", options: ["前端工程师", "后端工程师", "测试工程师", "产品经理", "设计师", "项目经理"], class: "!w-full" } },
        { prop: "workloadPercentage", label: "进度(%)", type: "field", component: "el-input-number", params: { min: 0, max: 100, step: 1, class: "!w-full" } },
        { prop: "hobby", label: "爱好", type: "field", component: "el-select", params: { placeholder: "选择爱好", options: ["篮球", "足球", "跑步", "游泳", "旅游", "其他"], class: "!w-full", multiple: true, allowCreate: true, filterable: true } },
      ],
    }
  },
  created() {
    try {
      let initialData = MOCK_STAFF_DATA
      const saved = localStorage.getItem("scheduler:data")
      if (saved) initialData = JSON.parse(saved)
      this.payload = initialData
    } catch {}
  },
  methods: {
    onDataChange(payload: any) {
      this.withdynamicIcon = "el-icon-refresh"
      console.log(structuredClone(payload))
      // localStorage.setItem("scheduler:data", JSON.stringify(payload))
    },
    onSave() {
      this.loading = true
      setTimeout(() => {
        localStorage.setItem("scheduler:data", JSON.stringify(this.payload))
        this.loading = false
        this.withdynamicIcon = "el-icon-finished"
        setTimeout(() => {
          this.withdynamicIcon = ""
        }, 1000)
      }, 1000)
    },
  },
}
</script>
