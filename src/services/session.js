import ApiHelper from '@/helpers/api.helpers.js'

class ModuleService extends ApiHelper {
  constructor() {
    super('/sessions')
  }
}

export default new ModuleService()
