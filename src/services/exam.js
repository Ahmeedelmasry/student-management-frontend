import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'
const apiUrl = import.meta.env.VITE_API_URL

class ModuleService extends ApiHelper {
  constructor() {
    super('/exams')
  }

  async getExamStudents(examId, params) {
    return await httpClient.get(`${this.url}/${examId}/students`, {
      params,
    })
  }

  async saveExamResults(body) {
    return await httpClient.post(`${apiUrl}/exam-results/save`, body)
  }

  async getExamResults(examId) {
    return await httpClient.get(`${apiUrl}/exam-results/${examId}`)
  }

  async updateExamResults(body) {
    return await httpClient.put(`${apiUrl}/exam-results/edit-results`, body)
  }
}

export default new ModuleService()
