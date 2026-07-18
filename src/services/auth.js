import ApiHelper from '@/helpers/api.helpers.js'
import httpClient from '@/../HTTPClient'

class AuthService extends ApiHelper {
  constructor() {
    super('/auth')
  }

  async login(body) {
    return await httpClient.post(`${this.url}/login`, body)
  }
}

export default new AuthService()
