import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class ModuleService extends ApiHelper {
  constructor() {
    super('/reports')
  }

  async getAttendanceReport(params) {
    return await httpClient.get(`${this.url}/attendance`, {
      params,
    })
  }

  async getAttendanceReportDetails(studentId, params) {
    return await httpClient.get(`${this.url}/attendance/${studentId}`, {
      params,
    })
  }

  async getPaymentsReport(params) {
    return await httpClient.get(`${this.url}/payments`, {
      params,
    })
  }
}

export default new ModuleService()
