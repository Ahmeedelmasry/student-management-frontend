import { createApp } from 'vue'
import App from '@/App.vue' // تعديل لإمبورت مطلق
import router from '@/router' // إمبورت الـ router
import axiosClient from '../HTTPClient'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/style.css'
import { createPinia } from 'pinia'
import VueCookies from 'vue-cookies'
import '@vuepic/vue-datepicker/dist/main.css'

window.axios = axiosClient
window.$cookie = VueCookies

const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        variables: {
          'font-family': '"Cairo", sans-serif',
        },
      },
    },
  },
    locale: {
    locale: "ar",
    rtl: {
      ar: true,
    },
  },
})

const app = createApp(App)
app.use(router) // تفعيل الراوتر
app.use(vuetify)
app.use(pinia)
app.mount('#app')
