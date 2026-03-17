import { MedusaService } from "@medusajs/framework/utils"
import SmtpConfig from "./models/smtp-config"

class SmtpConfigModuleService extends MedusaService({
  SmtpConfig,
}) {}

export default SmtpConfigModuleService
