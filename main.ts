import Vue from "vue"
import App from "./App.vue"
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
import VueRouter from "vue-router"
import SchedulerPage from "./pages/SchedulerPage.vue"
import "./styles/index.css"

Vue.use(ElementUI)
Vue.use(VueRouter)

Vue.config.warnHandler = msg => {
  if (/\$attrs is readonly|\$listeners is readonly/.test(msg)) return
}

const routes = [
  { path: "/scheduler", component: SchedulerPage, meta: { requiresAuth: false } },
  { path: "/", redirect: "/scheduler" },
]

const router = new VueRouter({ mode: "history", routes })

new Vue({
  router,
  render: h => h(App),
}).$mount("#root")
