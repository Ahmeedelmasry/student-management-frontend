import { defineStore } from 'pinia'

export const useMainStore = defineStore('main', {
  state: () => ({
    drawer: false,
    callSuccess: false,
    callMsg: '',
    callColor: 0,
    globalAlertType: '',
    globalAlertTitle: '',
    globalAlertText: '',
    btn_text: 'الغاء',
    globalAlert: false,
    toDel: null,
    regetData: false,
    uploadProgress: 0,
    apiUrl: import.meta.env.VITE_API_URL,
  }),
  actions: {
    handleErr(type, title, text, toDel) {
      this.globalAlertType = type
      this.globalAlertTitle = title
      this.globalAlertText = text
      this.toDel = toDel
      this.globalAlert = true
    },
    callResponse(responseType, msg, color) {
      this.callSuccess = responseType
      this.callMsg = msg
      this.callColor = color
    },
    resetSnackbar() {
      this.callSuccess = false
      this.callMsg = ''
    },
    async doDeleteItem() {
      let result
      await axios
        .delete(`${this.apiUrl}/${this.toDel.url}/${this.toDel._id}`, {
          headers: {
            Authorization: `${$cookie.get('logger')}`,
          },
        })
        .then((res) => {
          result = true
          this.callResponse(true, res.data.message, 1)
          this.regetData = true
          setTimeout(() => {
            this.regetData = false
          }, 100)
        })
        .catch((err) => {
          result = false
          this.callResponse(true, err.response.data.message, 2)
        })
      return result
    },
  },
})
