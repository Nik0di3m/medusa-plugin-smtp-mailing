import type { EmailTemplate, BaseLayoutFn } from "./providers/smtp/templates"

export type { EmailTemplate, BaseLayoutFn }
export { baseLayout, defaultBaseLayout } from "./providers/smtp/templates"

export interface SmtpProviderOptions {
  channels?: string[]
  templateOverrides?: Record<string, EmailTemplate>
  baseLayoutOverride?: BaseLayoutFn
}
