import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  entity_id: string
  token: string
  actor_type: string
}>) {
  const logger = container.resolve("logger")

  logger.info(`[SMTP] Handling auth.password_reset`)

  try {
    const notificationService = container.resolve(Modules.NOTIFICATION)

    const email = data.entity_id
    const token = data.token

    await notificationService.createNotifications({
      to: email,
      channel: "email",
      template: "password-reset",
      data: {
        email,
        token,
        reset_url: `${process.env.STORE_URL || "http://localhost:8000"}/reset-password?token=${token}&email=${encodeURIComponent(email)}`,
      },
    })

    logger.info(`[SMTP] Password reset email sent to ${email}`)
  } catch (error) {
    logger.error(
      `[SMTP] Failed to send password reset email: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
