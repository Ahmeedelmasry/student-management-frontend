import ApiHelper from '@/helpers/api.helpers.js'

class ModuleService extends ApiHelper {
  constructor() {
    super('/books')
  }
}

export default new ModuleService()
