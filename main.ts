import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles.css'

Vue.use(ElementUI)

Vue.config.warnHandler = (msg) => {
  if (/\$attrs is readonly|\$listeners is readonly/.test(msg)) return
}

const params = new URLSearchParams(window.location.search)
const readonlyParam = params.get('readonly')
const readonlyFromUrl = readonlyParam === '1' || readonlyParam === 'true'
const readonlyFromEnv = typeof (import.meta as any) !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.VITE_READONLY === 'true')
const readonly = readonlyParam != null ? readonlyFromUrl : readonlyFromEnv

const path = window.location.pathname || '/'
if (path === '/scheduler') {
  new Vue({
    render: h => h(App, { props: { readonly } })
  }).$mount('#root')
} else {
  const el = document.getElementById('root')
  if (el) {
    el.innerHTML = `<div style="padding:24px;font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial">
      <h2>Resource Scheduler Demo</h2>
      <p>Open <code>/scheduler</code> to view the Gantt Scheduler component.</p>
      <p><a href="/scheduler" style="color:#2563eb;text-decoration:underline">Go to /scheduler</a></p>
    </div>`
  }
}
