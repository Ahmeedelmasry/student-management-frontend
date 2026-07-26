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
import VueApexCharts from 'vue3-apexcharts'

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
        dark: false,

        variables: {
          'font-family': '"Cairo", sans-serif',
        },

        colors: {
          primary: '#00796B',
          secondary: '#424242',
          success: '#4CAF50',
          error: '#F44336',
          warning: '#FB8C00',
          info: '#2196F3',
        },
      },

      dark: {
        dark: true,

        variables: {
          'font-family': '"Cairo", sans-serif',
        },

        colors: {
          primary: '#00BFA5',
          secondary: '#BDBDBD',
          success: '#66BB6A',
          error: '#EF5350',
          warning: '#FFA726',
          info: '#29B6F6',
        },
      },
    },
  },
  locale: {
    locale: 'ar',
    rtl: {
      ar: true,
    },
  },
})

const app = createApp(App)
app.use(router) // تفعيل الراوتر
app.use(vuetify)
app.use(pinia)
app.use(VueApexCharts)
app.mount('#app')
