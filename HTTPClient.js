import axios from 'axios'
import { useMainStore } from '@/stores/index.js'

const URL = import.meta.env.VITE_API_URL

const axiosClient = axios.create({
  baseURL: URL,

  headers: {
    Accept: 'applicationjson'
  }
})

axiosClient.interceptors.request.use((config) => {
  const token = $cookies.get('logger')
  config.headers.Authorization = `${token}`
  return config
})

axiosClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code == 'ERR_NETWORK') {
      useMainStore().callResponse(true, 'Faild to connect server', 2)
    } else {
      useMainStore().callResponse(true, error.response?.data?.message || 'Something Went Wrong', 2)
    }

    if (error.response?.status === 401) {
      $cookies.remove('logger')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default axiosClient
