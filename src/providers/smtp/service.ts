import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  Logger,
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import nodemailer, { Transporter } from "nodemailer"
import { getTemplate } from "./templates"
import SmtpConfigModuleService from "../../modules/smtpConfig/service"
import { SMTP_CONFIG_MODULE } from "../../modules/smtpConfig"

type InjectedDependencies = {
  logger: Logger
  [key: string]: unknown
}

type SmtpConfig = {
  host: string
  port: number
  user?: string | null
  pass?: string | null
  from_email: string
  from_name?: string | null
  secure: boolean
  enabled: boolean
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-notification"

  protected logger_: Logger
  protected container_: InjectedDependencies

  static validateOptions(_options: Record<string, any>) {
    // Config is managed via Admin UI (database), not via static options.
    // No validation needed at boot time.
  }

  constructor(container: InjectedDependencies, _options: Record<string, any>) {
    super()

    this.logger_ = container.logger as Logger
    this.container_ = container
  }

  protected async getSmtpConfig(): Promise<SmtpConfig> {
    const smtpConfigService = this.container_[
      SMTP_CONFIG_MODULE
    ] as SmtpConfigModuleService

    if (!smtpConfigService) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "smtpConfig module not found. Make sure the plugin is registered in medusa-config.ts plugins."
      )
    }

    const [configs] = await smtpConfigService.listAndCountSmtpConfigs(
      {},
      { take: 1 }
    )

    const config = configs[0]

    if (!config) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "SMTP not configured. Go to Admin → Settings → SMTP to set up your mail server."
      )
    }

    if (!config.enabled) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "SMTP is disabled. Enable it in Admin → Settings → SMTP."
      )
    }

    return config
  }

  protected createTransporter(config: SmtpConfig): Transporter {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth:
        config.user && config.pass
          ? { user: config.user, pass: config.pass }
          : undefined,
      tls: { rejectUnauthorized: false },
    })
  }

  protected buildFromAddress(config: SmtpConfig): string {
    return config.from_name
      ? `"${config.from_name}" <${config.from_email}>`
      : config.from_email
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const config = await this.getSmtpConfig()
    const transporter = this.createTransporter(config)
    const from = this.buildFromAddress(config)

    const template = getTemplate(notification.template)

    if (!template) {
      this.logger_.warn(
        `[SMTP] No template found for "${notification.template}", sending with raw data`
      )

      const info = await transporter.sendMail({
        from,
        to: notification.to,
        subject: notification.template,
        html: JSON.stringify(notification.data),
      })

      return { id: info.messageId }
    }

    const subject = template.subject(notification.data || {})
    const html = template.html(notification.data || {})

    try {
      const info = await transporter.sendMail({
        from,
        to: notification.to,
        subject,
        html,
      })

      this.logger_.info(
        `[SMTP] Email sent to ${notification.to} (template: ${notification.template}, messageId: ${info.messageId})`
      )

      return { id: info.messageId }
    } catch (error) {
      this.logger_.error(
        `[SMTP] Failed to send email to ${notification.to}: ${error.message}`
      )
      throw error
    }
  }
}

export default SmtpNotificationProviderService
