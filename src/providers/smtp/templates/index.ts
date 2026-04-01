import * as orderPlaced from "./order-placed"
import * as orderCompleted from "./order-completed"
import * as orderCanceled from "./order-canceled"
import * as orderFulfillmentCreated from "./order-fulfillment-created"
import * as userCreated from "./user-created"
import * as passwordReset from "./password-reset"

export { baseLayout, defaultBaseLayout, setBaseLayout } from "./base-layout"
export type { BaseLayoutFn } from "./base-layout"

export interface EmailTemplate {
  subject: (data: Record<string, any>) => string
  html: (data: Record<string, any>) => string
}

const templates: Record<string, EmailTemplate> = {
  "order-placed": orderPlaced,
  "order.placed": orderPlaced,
  "order-completed": orderCompleted,
  "order.completed": orderCompleted,
  "order-canceled": orderCanceled,
  "order.canceled": orderCanceled,
  "order-fulfillment-created": orderFulfillmentCreated,
  "order.fulfillment_created": orderFulfillmentCreated,
  "order-shipment-created": orderFulfillmentCreated,
  "order.shipment_created": orderFulfillmentCreated,
  "user-created": userCreated,
  "user.created": userCreated,
  "customer.created": userCreated,
  "password-reset": passwordReset,
  "auth.password_reset": passwordReset,
}

export function getTemplate(
  templateName: string,
  overrides?: Record<string, EmailTemplate>
): EmailTemplate | undefined {
  return overrides?.[templateName] ?? templates[templateName]
}
