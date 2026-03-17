import { baseLayout } from "./base-layout"

interface FulfillmentCreatedData {
  order_id?: string
  display_id?: string | number
  customer_name?: string
  tracking_number?: string
  store_name?: string
}

export function subject(data: FulfillmentCreatedData): string {
  return `Order #${data.display_id || data.order_id || ""} Has Been Shipped`
}

export function html(data: FulfillmentCreatedData): string {
  const trackingHtml = data.tracking_number
    ? `
    <hr class="divider">
    <h2>Tracking Information</h2>
    <p>Tracking number: <strong>${data.tracking_number}</strong></p>`
    : ""

  const content = `
    <h2>Your order is on its way!</h2>
    <p>Hi ${data.customer_name || "Customer"},</p>
    <p>Great news! Your order <strong>#${data.display_id || data.order_id || ""}</strong> has been shipped.</p>
    ${trackingHtml}
    <p class="muted">Please allow a few days for delivery. If you have any questions, don't hesitate to reach out.</p>
  `

  return baseLayout(content, data.store_name)
}
