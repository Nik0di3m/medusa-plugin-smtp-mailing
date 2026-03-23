import { SMTP_CONFIG_MODULE } from "../modules/smtpConfig"
import SmtpConfigModuleService from "../modules/smtpConfig/service"

export type SmtpConfigData = {
  host: string
  port: number
  user?: string | null
  pass?: string | null
  from_email: string
  from_name?: string | null
  secure: boolean
  enabled: boolean
}

export async function resolveSmtpConfig(
  container: { resolve: (key: string) => unknown }
): Promise<SmtpConfigData | null> {
  const smtpConfigService = container.resolve(
    SMTP_CONFIG_MODULE
  ) as SmtpConfigModuleService

  const [configs] = await smtpConfigService.listAndCountSmtpConfigs(
    {},
    { take: 1 }
  )

  return configs[0] || null
}
