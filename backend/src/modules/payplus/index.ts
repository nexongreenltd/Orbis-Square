import { ModuleProvider, Modules } from '@medusajs/framework/utils'
import PayPlusProviderService from './service'

export default ModuleProvider(Modules.PAYMENT, {
  services: [PayPlusProviderService],
})
