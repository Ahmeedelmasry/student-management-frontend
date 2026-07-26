import { defineStore } from 'pinia'

export const useThemeStore = defineStore('themeStore', {
  state: () => ({
    theme: localStorage.getItem('theme') || 'يشقن',
  }),

  actions: {
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', this.theme)
    },
  },
})
