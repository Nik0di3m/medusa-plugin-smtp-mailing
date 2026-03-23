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
import { SmtpConfigData } from "../../lib/resolve-smtp-config"

type InjectedDependencies = {
  logger: Logger
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-notification"

  protected logger_: Logger

  static validateOptions(_options: Record<string, any>) {
    // Config is managed via Admin UI (database) and passed through notification.data.__smtp_config.
  }

  constructor({ logger }: InjectedDependencies, _options: Record<string, any>) {
    super()
    this.logger_ = logger
  }

  protected createTransporter(config: SmtpConfigData): Transporter {
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

  protected buildFromAddress(config: SmtpConfigData): string {
    return config.from_name
      ? `"${config.from_name}" <${config.from_email}>`
      : config.from_email
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const config = (notification.data as any)?.__smtp_config as
      | SmtpConfigData
      | undefined

    if (!config) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP config not found in notification data. Make sure subscribers pass __smtp_config."
      )
    }

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
