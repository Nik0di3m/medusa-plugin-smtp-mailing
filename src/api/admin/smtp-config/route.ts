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
  const logger = req.scope.resolve("logger")

  logger.info("[SMTP] Fetching SMTP configuration")

  const [configs] = await smtpConfigService.listAndCountSmtpConfigs(
    {},
    { take: 1 }
  )

  const config = configs[0] || null

  if (!config) {
    logger.info("[SMTP] No SMTP configuration found")
  }

  return res.json({ smtp_config: config })
}

export async function POST(
  req: AuthenticatedMedusaRequest<PostSmtpConfigSchema>,
  res: MedusaResponse
) {
  const smtpConfigService = req.scope.resolve(
    SMTP_CONFIG_MODULE
  ) as SmtpConfigModuleService
  const logger = req.scope.resolve("logger")
  const data = req.validatedBody

  logger.info(`[SMTP] Saving SMTP config: host=${data.host}, port=${data.port}, from=${data.from_email}, secure=${data.secure}, enabled=${data.enabled}`)

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
    logger.info(`[SMTP] Configuration updated (id: ${existingConfigs[0].id})`)
  } else {
    config = await smtpConfigService.createSmtpConfigs(data)
    logger.info(`[SMTP] Configuration created`)
  }

  return res.json({ smtp_config: config })
}
