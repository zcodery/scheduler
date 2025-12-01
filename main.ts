import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

const params = new URLSearchParams(window.location.search)
const readonlyParam = params.get('readonly')
const readonlyFromUrl = readonlyParam === '1' || readonlyParam === 'true'
const readonlyFromEnv = typeof (import.meta as any) !== 'undefined' && (import.meta as any).env && ((import.meta as any).env.VITE_READONLY === 'true')
const readonly = readonlyParam != null ? readonlyFromUrl : readonlyFromEnv

new Vue({
  render: h => h(App, { props: { readonly } })
}).$mount('#root')
