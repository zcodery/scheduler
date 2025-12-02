import Vue from 'vue'
import Root from './Root.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles.css'
import VueRouter from 'vue-router'
import SchedulerPage from './pages/SchedulerPage.vue'

Vue.use(ElementUI)
Vue.use(VueRouter)

Vue.config.warnHandler = (msg) => {
  if (/\$attrs is readonly|\$listeners is readonly/.test(msg)) return
}

const routes = [
  { path: '/scheduler', component: SchedulerPage, meta: { requiresAuth: false } },
  { path: '/', redirect: '/scheduler' },
]

const router = new VueRouter({ mode: 'history', routes })

router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.requiresAuth) {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) return next('/')
  }
  next()
})

new Vue({
  router,
  render: h => h(Root)
}).$mount('#root')
