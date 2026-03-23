import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { resolveSmtpConfig } from "../lib/resolve-smtp-config"

export default async function userCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  logger.info(`[SMTP] Handling customer.created for customer: ${data.id}`)

  try {
    const smtpConfig = await resolveSmtpConfig(container)

    if (!smtpConfig || !smtpConfig.enabled) {
      logger.info("[SMTP] SMTP disabled or not configured, skipping")
      return
    }

    const query = container.resolve("query")
    const notificationService = container.resolve(Modules.NOTIFICATION)

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name"],
      filters: { id: data.id },
    })

    if (!customers || customers.length === 0) {
      logger.warn(`[SMTP] Customer ${data.id} not found`)
      return
    }

    const customer = customers[0]

    await notificationService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "user-created",
      data: {
        __smtp_config: smtpConfig,
        email: customer.email,
        first_name: customer.first_name,
      },
    })

    logger.info(
      `[SMTP] Welcome email sent to ${customer.email}`
    )
  } catch (error) {
    logger.error(
      `[SMTP] Failed to send welcome email for customer ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
