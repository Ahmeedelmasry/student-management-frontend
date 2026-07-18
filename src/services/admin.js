import ApiHelper from '@/helpers/api.helpers.js'

class ModuleService extends ApiHelper {
  constructor() {
    super('/admins')
  }
}

export default new ModuleService()
