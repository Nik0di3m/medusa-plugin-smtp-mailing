import { baseLayout } from "./base-layout"

interface OrderItem {
  title?: string
  product_title?: string
  quantity?: number
  unit_price?: number
}

interface OrderPlacedData {
  order_id?: string
  display_id?: string | number
  customer_name?: string
  items?: OrderItem[]
  total?: number
  currency_code?: string
  shipping_address?: {
    address_1?: string
    city?: string
    postal_code?: string
    country_code?: string
  }
  store_name?: string
}

export function subject(data: OrderPlacedData): string {
  return `Order Confirmation #${data.display_id || data.order_id || ""}`
}

export function html(data: OrderPlacedData): string {
  const items = data.items || []
  const currency = (data.currency_code || "USD").toUpperCase()

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.title || item.product_title || "Item"}</td>
      <td style="text-align:center;">${item.quantity || 1}</td>
      <td style="text-align:right;">${currency} ${(item.unit_price ?? 0).toFixed(2)}</td>
    </tr>`
    )
    .join("")

  const addressHtml = data.shipping_address
    ? `
    <hr class="divider">
    <h2>Shipping Address</h2>
    <p>
      ${data.shipping_address.address_1 || ""}<br>
      ${data.shipping_address.city || ""} ${data.shipping_address.postal_code || ""}<br>
      ${(data.shipping_address.country_code || "").toUpperCase()}
    </p>`
    : ""

  const content = `
    <h2>Thank you for your order!</h2>
    <p>Hi ${data.customer_name || "Customer"},</p>
    <p>We've received your order <strong>#${data.display_id || data.order_id || ""}</strong> and it's being processed.</p>

    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="total-row">
          <td colspan="2" style="text-align:right;">Total:</td>
          <td style="text-align:right;">${currency} ${(data.total ?? 0).toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
    ${addressHtml}
  `

  return baseLayout(content, data.store_name)
}
