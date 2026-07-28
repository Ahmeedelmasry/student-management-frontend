import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class ModuleService extends ApiHelper {
  constructor() {
    super('/payments')
  }

  async bulkBookPay(body) {
    return await httpClient.post(`${this.url}/bulk-pay`, body)
  }
}

export default new ModuleService()
