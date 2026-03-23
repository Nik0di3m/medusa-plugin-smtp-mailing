import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { resolveSmtpConfig } from "../lib/resolve-smtp-config"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  logger.info(`[SMTP] Handling order.canceled for order: ${data.id}`)

  try {
    const smtpConfig = await resolveSmtpConfig(container)

    if (!smtpConfig || !smtpConfig.enabled) {
      logger.info("[SMTP] SMTP disabled or not configured, skipping")
      return
    }

    const query = container.resolve("query")
    const notificationService = container.resolve(Modules.NOTIFICATION)

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "customer.first_name",
        "customer.last_name",
      ],
      filters: { id: data.id },
    })

    if (!orders || orders.length === 0) {
      logger.warn(`[SMTP] Order ${data.id} not found`)
      return
    }

    const order = orders[0]

    await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-canceled",
      data: {
        __smtp_config: smtpConfig,
        order_id: order.id,
        display_id: order.display_id,
        customer_name: [order.customer?.first_name, order.customer?.last_name]
          .filter(Boolean)
          .join(" ") || "Customer",
      },
    })

    logger.info(`[SMTP] Order canceled email sent for order ${data.id}`)
  } catch (error) {
    logger.error(
      `[SMTP] Failed to send order canceled email for ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
