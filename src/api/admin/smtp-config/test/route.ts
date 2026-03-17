import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SMTP_CONFIG_MODULE } from "../../../../modules/smtpConfig"
import SmtpConfigModuleService from "../../../../modules/smtpConfig/service"
import nodemailer from "nodemailer"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const logger = req.scope.resolve("logger")
  const smtpConfigService = req.scope.resolve(
    SMTP_CONFIG_MODULE
  ) as SmtpConfigModuleService

  const { to } = req.body as { to?: string }

  if (!to) {
    logger.warn("[SMTP Test] No recipient email provided")
    return res.status(400).json({ error: "Field 'to' is required" })
  }

  logger.info(`[SMTP Test] Sending test email to ${to}`)

  const [configs] = await smtpConfigService.listAndCountSmtpConfigs(
    {},
    { take: 1 }
  )

  const config = configs[0]

  if (!config) {
    logger.error("[SMTP Test] No SMTP configuration found")
    return res.status(400).json({ error: "SMTP not configured. Save configuration first." })
  }

  if (!config.enabled) {
    logger.warn("[SMTP Test] SMTP is disabled")
    return res.status(400).json({ error: "SMTP is disabled. Enable it first." })
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? config.port === 465,
    auth:
      config.user && config.pass
        ? { user: config.user, pass: config.pass }
        : undefined,
  })

  // Verify SMTP connection first
  try {
    logger.info(`[SMTP Test] Verifying connection to ${config.host}:${config.port}...`)
    await transporter.verify()
    logger.info("[SMTP Test] SMTP connection verified successfully")
  } catch (error: any) {
    logger.error(`[SMTP Test] SMTP connection failed: ${error.message}`)
    return res.status(400).json({
      error: `SMTP connection failed: ${error.message}`,
    })
  }

  // Send test email
  try {
    const fromAddress = config.from_name
      ? `"${config.from_name}" <${config.from_email}>`
      : config.from_email

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: "SMTP Test Email",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">SMTP Configuration Test</h2>
          <p>This is a test email from your Medusa store SMTP plugin.</p>
          <p style="color: #666; font-size: 14px;">
            Server: ${config.host}:${config.port}<br/>
            Secure: ${config.secure ? "Yes" : "No"}<br/>
            From: ${fromAddress}
          </p>
          <p style="color: #999; font-size: 12px;">
            Sent at ${new Date().toISOString()}
          </p>
        </div>
      `,
    })

    logger.info(`[SMTP Test] Test email sent to ${to} (messageId: ${info.messageId})`)

    return res.json({
      success: true,
      message_id: info.messageId,
    })
  } catch (error: any) {
    logger.error(`[SMTP Test] Failed to send test email: ${error.message}`)
    return res.status(400).json({
      error: `Failed to send email: ${error.message}`,
    })
  }
}
