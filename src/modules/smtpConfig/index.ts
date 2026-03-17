import SmtpConfigModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const SMTP_CONFIG_MODULE = "smtpConfig"

export default Module(SMTP_CONFIG_MODULE, {
  service: SmtpConfigModuleService,
})
