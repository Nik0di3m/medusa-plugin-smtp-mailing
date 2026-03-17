import { baseLayout } from "./base-layout"

interface OrderCompletedData {
  order_id?: string
  display_id?: string | number
  customer_name?: string
  store_name?: string
}

export function subject(data: OrderCompletedData): string {
  return `Order #${data.display_id || data.order_id || ""} Completed`
}

export function html(data: OrderCompletedData): string {
  const content = `
    <h2>Your order is complete!</h2>
    <p>Hi ${data.customer_name || "Customer"},</p>
    <p>Your order <strong>#${data.display_id || data.order_id || ""}</strong> has been completed.</p>
    <p>Thank you for shopping with us! We hope you enjoy your purchase.</p>
    <p class="muted">If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
  `

  return baseLayout(content, data.store_name)
}
