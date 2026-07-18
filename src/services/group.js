import ApiHelper from '@/helpers/api.helpers.js'

class ModuleService extends ApiHelper {
  constructor() {
    super('/groups')
  }
}

export default new ModuleService()
