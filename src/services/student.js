import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class ModuleService extends ApiHelper {
  constructor() {
    super('/students')
  }

  async scanAttendance(barcode) {
    return await httpClient.post(`${this.url}/scan/${barcode}`)
  }
}

export default new ModuleService()
