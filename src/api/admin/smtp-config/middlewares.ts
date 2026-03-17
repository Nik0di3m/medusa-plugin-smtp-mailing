import {
  MiddlewareRoute,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { z } from "zod"

export const PostSmtpConfigSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  user: z.string().optional().nullable(),
  pass: z.string().optional().nullable(),
  from_email: z.string().email(),
  from_name: z.string().optional().nullable(),
  secure: z.boolean().optional().default(false),
  enabled: z.boolean().optional().default(true),
})

export type PostSmtpConfigSchema = z.infer<typeof PostSmtpConfigSchema>

export const smtpConfigMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/smtp-config",
    method: "POST",
    middlewares: [validateAndTransformBody(PostSmtpConfigSchema)],
  },
]
