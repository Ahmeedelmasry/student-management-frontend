import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class ModuleService extends ApiHelper {
  constructor() {
    super('/students')
  }

  async scanAttendance(barcode, params) {
    return await httpClient.post(
      `${this.url}/scan/${barcode}`,
      {},
      {
        params,
      },
    )
  }

  async getStudentWithMultipleFilters(params) {
    return await httpClient.get(`${this.url}/all/multiple-filters`, {
      params,
    })
  }
}

export default new ModuleService()
