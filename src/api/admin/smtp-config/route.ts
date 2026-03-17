import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SMTP_CONFIG_MODULE } from "../../../modules/smtpConfig"
import SmtpConfigModuleService from "../../../modules/smtpConfig/service"
import { PostSmtpConfigSchema } from "./middlewares"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const smtpConfigService = req.scope.resolve(
    SMTP_CONFIG_MODULE
  ) as SmtpConfigModuleService

  const [configs] = await smtpConfigService.listAndCountSmtpConfigs(
    {},
    { take: 1 }
  )

  const config = configs[0] || null

  return res.json({ smtp_config: config })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PostSmtpConfigSchema>,
  res: MedusaResponse
) {
  const smtpConfigService = req.scope.resolve(
    SMTP_CONFIG_MODULE
  ) as SmtpConfigModuleService
  const data = req.validatedBody

  const [existingConfigs] = await smtpConfigService.listAndCountSmtpConfigs(
    {},
    { take: 1 }
  )

  let config

  if (existingConfigs.length > 0) {
    config = await smtpConfigService.updateSmtpConfigs({
      id: existingConfigs[0].id,
      ...data,
    })
  } else {
    config = await smtpConfigService.createSmtpConfigs(data)
  }

  return res.json({ smtp_config: config })
}
