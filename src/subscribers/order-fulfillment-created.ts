import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { resolveSmtpConfig } from "../lib/resolve-smtp-config"

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve("logger")

  if (data.no_notification) {
    logger.info("[SMTP] shipment.created has no_notification flag, skipping")
    return
  }

  logger.info(`[SMTP] Handling shipment.created for fulfillment: ${data.id}`)

  try {
    const smtpConfig = await resolveSmtpConfig(container)

    if (!smtpConfig || !smtpConfig.enabled) {
      logger.info("[SMTP] SMTP disabled or not configured, skipping")
      return
    }

    const query = container.resolve("query")
    const notificationService = container.resolve(Modules.NOTIFICATION)

    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "tracking_links.*",
        "order.id",
        "order.display_id",
        "order.email",
        "order.customer.first_name",
        "order.customer.last_name",
      ],
      filters: { id: data.id },
    })

    if (!fulfillments || fulfillments.length === 0) {
      logger.warn(`[SMTP] Fulfillment ${data.id} not found`)
      return
    }

    const fulfillment = fulfillments[0]
    const order = fulfillment.order

    if (!order) {
      logger.warn(`[SMTP] No order linked to fulfillment ${data.id}`)
      return
    }

    const trackingNumber =
      fulfillment.tracking_links?.[0]?.tracking_number || undefined

    await notificationService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-fulfillment-created",
      data: {
        __smtp_config: smtpConfig,
        order_id: order.id,
        display_id: order.display_id,
        customer_name: [order.customer?.first_name, order.customer?.last_name]
          .filter(Boolean)
          .join(" ") || "Customer",
        tracking_number: trackingNumber,
      },
    })

    logger.info(
      `[SMTP] Shipment email sent for fulfillment ${data.id} (order ${order.id})`
    )
  } catch (error) {
    logger.error(
      `[SMTP] Failed to send shipment email for fulfillment ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
