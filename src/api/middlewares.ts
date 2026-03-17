import { defineMiddlewares } from "@medusajs/framework/http"
import { smtpConfigMiddlewares } from "./admin/smtp-config/middlewares"
import { smtpTestMiddlewares } from "./admin/smtp-test/middlewares"

export default defineMiddlewares({
  routes: [
    ...smtpConfigMiddlewares,
    ...smtpTestMiddlewares,
  ],
})
