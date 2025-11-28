import Vue from 'vue'
import ConfirmHost from './ConfirmHost.vue'

type ConfirmOptions = {
  title?: string
  message?: any
  confirmButtonText?: string
  cancelButtonText?: string
  showClose?: boolean
  beforeClose?: (action: 'confirm' | 'cancel') => boolean | Promise<boolean>
  className?: string
}

export const Confirm = {
  show(options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const container = document.createElement('div')
      document.body.appendChild(container)
      const closeHost = () => {
        try { vm.$destroy() } catch {}
        container.remove()
      }
      const vm = new Vue({
        render: h => h(ConfirmHost, { props: { options, resolve, reject, closeHost } })
      })
      vm.$mount(container)
    })
  }
}
