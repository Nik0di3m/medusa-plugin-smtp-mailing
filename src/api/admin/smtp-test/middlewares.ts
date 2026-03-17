import { MiddlewareRoute } from "@medusajs/framework/http"

// force plugin:build to compile route.ts (it only follows import graph)
import "./route"

export const smtpTestMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/smtp-test",
    method: "POST",
    middlewares: [],
  },
]
