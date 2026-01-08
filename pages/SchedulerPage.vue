<template>
  <gantt-scheduler class="min-h-screen h-screen" :readonly="readonly" :task="payload" :view-mode.sync="viewMode" :title="title" :description="description" :staff-config="staffConfig" @data-change="onDataChange">
    <template #staffDescription="{ staff }">
      <el-tag size="mini" type="primary" effect="plain" v-if="staff.role">{{ staff.role }}</el-tag>
    </template>
    <template #workloadBar="{ staff }">
      <workload-bar :percentage="staff.workloadPercentage" v-if="staff.workloadPercentage"></workload-bar>
    </template>
    <template #extra>
      <el-dropdown size="mini" @command="onRefresh" split-button type="primary" :disabled="idleAnimationFrame">
        <span class="el-dropdown-link">{{ idleAnimationFrame ? `正则加载数据中(${payload.length}/${realSize})` : `刷新数据(${realSize})` }}</span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="small">少量虚拟数据</el-dropdown-item>
          <el-dropdown-item command="large">大量虚拟数据</el-dropdown-item>
          <el-dropdown-item command="real">真实数据</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button v-if="!readonly" size="mini" type="success" :icon="withdynamicIcon" @click="onSave" :loading="loading">保存</el-button>
      <el-switch size="mini" v-model="readonly" active-color="#13ce66" inactive-color="#409eff" :active-text="readonly ? '只读模式' : '编辑模式'"></el-switch>
    </template>
  </gantt-scheduler>
</template>

<script>
import WorkloadBar from "./components/WorkloadBar.vue"
import GanttScheduler from "@/GanttScheduler/index.vue"
import { getMockStaffData, MOCK_ROLE_DATA, REAL_STAFF_DATA } from "./database/gantt"

export default {
  components: { "gantt-scheduler": GanttScheduler, WorkloadBar },
  data() {
    return {
      title: "人员排期",
      description: "拖动图表滑动 • 双击编辑 • 右键管理",
      viewMode: "month",
      readonly: false,
      payload: [],
      withdynamicIcon: "",
      loading: false,
      staffConfig: [
        { span: 12, prop: "role", label: "职位", type: "picker", component: "el-select", params: { placeholder: "选择职位", options: MOCK_ROLE_DATA, class: "rs-full-width" } },
        { span: 12, prop: "hobby", label: "爱好", type: "field", component: "el-select", params: { placeholder: "选择爱好", options: ["篮球", "足球", "跑步", "游泳", "旅游", "其他"], class: "rs-full-width", multiple: true, allowCreate: true, filterable: true } },
        { prop: "workloadPercentage", label: "进度(%)", type: "field", component: "el-input-number", params: { min: 0, max: 100, step: 1, class: "rs-full-width" } },
      ],
      realTasks: [],
      realSize: 0,
      timer: null,
      idleAnimationFrame: null,
      updateData: {},
    }
  },
  created() {
    this.onRefresh()
  },
  methods: {
    onRefresh(isReplacementRole = "") {
      console.time("on-refresh")
      let initialData = []
      try {
        // if (!isReplacementRole) {
        //   const saved = localStorage.getItem("scheduler:data")
        //   if (saved) initialData = JSON.parse(saved)
        // }
      } catch {}
      const result = initialData?.length ? initialData : isReplacementRole === "real" ? REAL_STAFF_DATA : getMockStaffData(isReplacementRole === "large" ? 1000 : Math.ceil(Math.random() * 200))
      this.realSize = result.length
      this.updateData = {}

      let index = 0
      this.payload = []
      this.idleAnimationFrame && window.cancelAnimationFrame(this.idleAnimationFrame)
      const animationFrame = () => {
        if (index == result.length || result.length == 0) return (this.idleAnimationFrame = null)
        if (this.updateData?.id) {
          const item = this.payload.find(item => item.id === this.updateData.id)
          if (item) {
            Object.assign(item, this.updateData)
            this.updateData = {}
          }
        }
        this.payload.push(result[index])
        this.realTasks = structuredClone(this.payload)
        index++
        this.idleAnimationFrame = requestAnimationFrame(animationFrame)
      }
      animationFrame()

      console.timeEnd("on-refresh")

      // if (this.timer) clearInterval(this.timer)
      // this.timer = setInterval(() => {
      //   console.log(`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`)
      // }, 1000)
    },
    onDataChange(result) {
      const { payload, changedStaff, changedTask, editType } = result || {}
      console.log("onDataChange:", { payload, changedStaff, changedTask, editType })

      // this.withdynamicIcon = "el-icon-refresh"
      // if (Array.isArray(payload)) this.realTasks = structuredClone(payload)
      // if (changedStaff && changedStaff.id != null) {
      //   console.log("changed staff:", structuredClone(changedStaff))
      //   this.updateData = changedStaff
      // }
      // if (changedTask && changedTask.uid != null) {
      //   console.log("changed task:", structuredClone(changedTask), "editType:", editType)
      // }
      // if (!this.idleAnimationFrame && Array.isArray(payload)) {
      //   console.log(structuredClone(payload))
      // }
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
