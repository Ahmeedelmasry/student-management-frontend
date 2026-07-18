import { defineStore } from 'pinia'
import { useMainStore } from '@/stores/index.js'
import { jwtDecode } from 'jwt-decode'
import AuthService from '@/services/auth.js'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    loggerData: {},
    token: null,
  }),
  actions: {
    decodeToken(token) {
      const decoded = jwtDecode(token)
      this.loggerData = decoded.data
      this.token = token
    },
    async doLogin(body) {
      try {
        const { data } = await AuthService.login(body)
        this.decodeToken(data.token)
        return true
      } catch (error) {
      console.log(error);
        if (error.code == 'ERR_NETWORK') {
          useMainStore().callResponse(true, 'Faild to connect server', 2)
        } else {
          useMainStore().callResponse(
            true,
            error.response?.data?.message || 'Something Went Wrong',
            2
          )
        }
        return false
      }
    }
  }
})
