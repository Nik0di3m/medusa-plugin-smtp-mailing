import { baseLayout } from "./base-layout"

interface PasswordResetData {
  email?: string
  first_name?: string
  reset_url?: string
  token?: string
  store_name?: string
}

export function subject(data: PasswordResetData): string {
  return `Password Reset Request`
}

export function html(data: PasswordResetData): string {
  const resetUrl = data.reset_url || "#"

  const content = `
    <h2>Password Reset</h2>
    <p>Hi ${data.first_name || "there"},</p>
    <p>We received a request to reset the password for the account associated with <strong>${data.email || ""}</strong>.</p>
    <p>Click the button below to reset your password:</p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </p>
    <p class="muted">If you didn't request a password reset, you can safely ignore this email. The link will expire shortly.</p>
    ${data.token ? `<p class="muted" style="font-size:11px;">Token: ${data.token}</p>` : ""}
  `

  return baseLayout(content, data.store_name)
}
