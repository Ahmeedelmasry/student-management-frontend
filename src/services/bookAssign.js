import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class ModuleService extends ApiHelper {
  constructor() {
    super('/book-assignments')
  }

  async getUnassignedStudents(bookId, params) {
    return await httpClient.get(`${this.url}/unassigned-students/${bookId}`, { params })
  }

  async bulkAssignStudents(bookId, body) {
    return await httpClient.post(`${this.url}/assign-students/${bookId}`, body)
  }

  async getAssignedStudents(bookId, params) {
    return await httpClient.get(`${this.url}/assigned-students/${bookId}`, { params })
  }

  async bulkUnassignStudents(bookId, body) {
    return await httpClient.post(`${this.url}/unassign-students/${bookId}`, body)
  }
}

export default new ModuleService()
