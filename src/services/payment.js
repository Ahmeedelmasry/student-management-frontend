import ApiHelper from '@/helpers/api.helpers.js'

class ModuleService extends ApiHelper {
  constructor() {
    super('/payments')
  }
}

export default new ModuleService()
