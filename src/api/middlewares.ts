import { defineMiddlewares } from "@medusajs/framework/http"
import { smtpConfigMiddlewares } from "./admin/smtp-config/middlewares"

export default defineMiddlewares({
  routes: [...smtpConfigMiddlewares],
})
