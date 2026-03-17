import { model } from "@medusajs/framework/utils"

const SmtpConfig = model.define("smtp_config", {
  id: model.id().primaryKey(),
  host: model.text().default(""),
  port: model.number().default(587),
  user: model.text().nullable(),
  pass: model.text().nullable(),
  from_email: model.text().default(""),
  from_name: model.text().nullable(),
  secure: model.boolean().default(false),
  enabled: model.boolean().default(true),
})

export default SmtpConfig
