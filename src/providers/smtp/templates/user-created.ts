import { baseLayout } from "./base-layout"

interface UserCreatedData {
  email?: string
  first_name?: string
  store_name?: string
}

export function subject(data: UserCreatedData): string {
  return `Welcome to ${data.store_name || "our store"}!`
}

export function html(data: UserCreatedData): string {
  const content = `
    <h2>Welcome!</h2>
    <p>Hi ${data.first_name || "there"},</p>
    <p>Thank you for creating an account with us. We're excited to have you on board!</p>
    <p>Your account has been set up with the email address: <strong>${data.email || ""}</strong></p>
    <p>You can now browse our products, track your orders, and enjoy a personalized shopping experience.</p>
    <p class="muted">If you didn't create this account, please contact our support team immediately.</p>
  `

  return baseLayout(content, data.store_name)
}
