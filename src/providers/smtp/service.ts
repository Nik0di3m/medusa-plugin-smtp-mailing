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

type InjectedDependencies = {
  logger: Logger
}

export type SmtpProviderOptions = {
  host: string
  port: number
  user?: string
  pass?: string
  from: string
  secure?: boolean
}

class SmtpNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "smtp-notification"

  protected logger_: Logger
  protected options_: SmtpProviderOptions
  protected transporter_: Transporter

  static validateOptions(options: Record<string, any>) {
    if (!options.host) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP host is required in the provider's options."
      )
    }
    if (!options.port) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP port is required in the provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SMTP from address is required in the provider's options."
      )
    }
  }

  constructor(
    { logger }: InjectedDependencies,
    options: SmtpProviderOptions
  ) {
    super()

    this.logger_ = logger
    this.options_ = options

    this.transporter_ = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure ?? options.port === 465,
      auth:
        options.user && options.pass
          ? {
              user: options.user,
              pass: options.pass,
            }
          : undefined,
    })
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = getTemplate(notification.template)

    if (!template) {
      this.logger_.warn(
        `[SMTP] No template found for "${notification.template}", sending with raw data`
      )

      const info = await this.transporter_.sendMail({
        from: this.options_.from,
        to: notification.to,
        subject: notification.template,
        html: JSON.stringify(notification.data),
      })

      return { id: info.messageId }
    }

    const subject = template.subject(notification.data || {})
    const html = template.html(notification.data || {})

    try {
      const info = await this.transporter_.sendMail({
        from: this.options_.from,
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
