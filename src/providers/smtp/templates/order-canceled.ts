import { baseLayout } from "./base-layout"

interface OrderCanceledData {
  order_id?: string
  display_id?: string | number
  customer_name?: string
  reason?: string
  store_name?: string
}

export function subject(data: OrderCanceledData): string {
  return `Order #${data.display_id || data.order_id || ""} Canceled`
}

export function html(data: OrderCanceledData): string {
  const reasonHtml = data.reason
    ? `<p><strong>Reason:</strong> ${data.reason}</p>`
    : ""

  const content = `
    <h2>Order Canceled</h2>
    <p>Hi ${data.customer_name || "Customer"},</p>
    <p>We're writing to let you know that your order <strong>#${data.display_id || data.order_id || ""}</strong> has been canceled.</p>
    ${reasonHtml}
    <p>If you believe this was a mistake or have any questions, please contact our support team.</p>
    <p class="muted">Any payment made will be refunded to your original payment method.</p>
  `

  return baseLayout(content, data.store_name)
}
