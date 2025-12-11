<template>
  <gantt-scheduler class="min-h-screen h-screen" :readonly="readonly" :task="payload" :title="title" :description="description" :staffConfig="staffConfig" @data-change="onDataChange">
    <!-- <template #avatar="{ staff }">
      <img v-if="staff.avatar" :src="staff.avatar" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <img v-else-if="staff.name == '王五'" src="/avatar.jpg" :alt="staff.name" class="w-10 h-10 rounded-full object-cover border border-gray-200 flex-shrink-0 select-none" />
      <div v-else :class="staff.avatarColor" class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold">{{ staff.name.charAt(0) }}</div>
    </template> -->
    <template #staffDescription="{ staff }">
      <el-tag size="mini" type="primary" effect="plain">{{ staff.role || "未设置职位" }}</el-tag>
    </template>
    <template #workloadBar="{ staff }">
      <workload-bar :percentage="staff.workloadPercentage"></workload-bar>
    </template>
    <template #extra>
      <el-button size="mini" type="info" icon="el-icon-refresh" @click="onRefresh(true)" :loading="loading">刷新数据</el-button>
      <el-button v-if="!readonly" size="mini" type="success" :icon="withdynamicIcon" @click="onSave" :loading="loading">保存</el-button>
      <el-switch size="mini" v-model="readonly" active-color="#13ce66" inactive-color="#409eff" :active-text="readonly ? '只读模式' : '编辑模式'"></el-switch>
    </template>
  </gantt-scheduler>
</template>

<script lang="ts">
import WorkloadBar from "./components/WorkloadBar.vue"
import GanttScheduler from "@/GanttScheduler/index.vue"
import { getMockStaffData, MOCK_ROLE_DATA } from "./database/gantt"
import { Staff } from "@/GanttScheduler/types"

export default {
  components: { "gantt-scheduler": GanttScheduler, WorkloadBar },
  data() {
    return {
      title: "人员排期",
      description: "拖动图表滑动 • 双击编辑 • 右键管理",
      readonly: false,
      payload: [] as Staff[],
      withdynamicIcon: "",
      loading: false,
      staffConfig: [
        { span: 12, prop: "role", label: "职位", type: "picker", component: "el-select", params: { placeholder: "选择职位", options: MOCK_ROLE_DATA, class: "rs-full-width" } },
        { span: 12, prop: "hobby", label: "爱好", type: "field", component: "el-select", params: { placeholder: "选择爱好", options: ["篮球", "足球", "跑步", "游泳", "旅游", "其他"], class: "rs-full-width", multiple: true, allowCreate: true, filterable: true } },
        { prop: "workloadPercentage", label: "进度(%)", type: "field", component: "el-input-number", params: { min: 0, max: 100, step: 1, class: "rs-full-width" } },
      ],
      realTasks: [] as Staff[],
    }
  },
  created() {
    this.onRefresh(false)
  },
  methods: {
    onRefresh(isReplacement: boolean = true) {
      let initialData: Staff[] = getMockStaffData()
      try {
        // if(isReplacement) {
        //   this.$confirm("确认刷新数据吗？", "提示", { confirmButtonText: "确定", cancelButtonText: "取消", type: "warning" }).then(() => {
        //     this.onRefresh(true)
        //   })
        // }
        if (!isReplacement) {
          const saved = localStorage.getItem("scheduler:data")
          if (saved) initialData = JSON.parse(saved)
        }
      } catch {}
      this.payload = initialData
      this.realTasks = structuredClone(this.payload)
    },
    onDataChange(payload: any) {
      this.withdynamicIcon = "el-icon-refresh"
      this.realTasks = structuredClone(payload)
      console.log(structuredClone(payload))
      // this.payload = structuredClone(payload)
      // localStorage.setItem("scheduler:data", JSON.stringify(payload))
    },
    onSave() {
      this.loading = true
      setTimeout(() => {
        console.log(structuredClone(this.realTasks))
        localStorage.setItem("scheduler:data", JSON.stringify(this.realTasks))
        this.loading = false
        this.withdynamicIcon = "el-icon-finished"
        this.$message.success("保存成功")
        setTimeout(() => {
          this.withdynamicIcon = ""
        }, 1000)
      }, 1000)
    },
  },
}
</script>

<style lang="scss" scoped>
.min-h-screen {
  min-height: 100vh;
}
.h-screen {
  height: 100vh;
}
</style>
