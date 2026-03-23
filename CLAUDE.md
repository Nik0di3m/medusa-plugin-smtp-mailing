# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this?

`@nik0di3m/medusa-plugin-smtp-mailing` — a Medusa.js v2 plugin that provides SMTP email notifications via nodemailer. Published to GitHub Packages npm registry.

## Commands

```bash
yarn build          # medusa plugin:build — compiles to .medusa/server/
yarn dev            # medusa plugin:develop — watch mode
```

No test suite exists. Package manager: **Yarn 4** (Berry, `.yarnrc.yml`).

For local testing in a Medusa project, use `yalc` (included as devDep):
```bash
yalc publish        # after build, push to local yalc store
# in consuming project:
yalc add @nik0di3m/medusa-plugin-smtp-mailing
```

## Architecture

### Provider (`src/providers/smtp/`)
- `service.ts` — `SmtpNotificationProviderService` extends `AbstractNotificationProviderService`. Identifier: `smtp-notification`. Reads SMTP config from the `smtpConfig` database module at send time (no static options needed at boot). Creates a fresh nodemailer transporter per `send()` call based on current DB config.
- `templates/` — HTML email templates. Each exports `subject(data)` and `html(data)`. Template registry in `templates/index.ts` maps both kebab-case (`order-placed`) and dot-notation (`order.placed`) keys to the same template. `base-layout.ts` provides a shared HTML wrapper.

### Module (`src/modules/smtpConfig/`)
- Custom Medusa module (key: `smtpConfig`) for persisting SMTP configuration in the database. Uses MikroORM model `smtp_config` with fields: host, port, user, pass, from_email, from_name, secure, enabled.
- Single-row pattern: only one config record exists, fetched with `listAndCountSmtpConfigs({}, { take: 1 })`.
- Migrations in `migrations/` — managed by MikroORM.

### API Routes (`src/api/`)
- `admin/smtp-config/` — GET/POST for reading/saving SMTP config. POST validated with Zod schema.
- `admin/smtp-test/` — POST to send a test email using config from DB (creates its own transporter, doesn't go through the notification provider).
- `middlewares.ts` — aggregates all route middlewares. **Important**: `plugin:build` only compiles files reachable through the import graph. New route directories MUST have their `route.ts` imported (directly or via a local `middlewares.ts`) to be included in the build output. See `BUG_REPORT.md`.

### Subscribers (`src/subscribers/`)
Event handlers that call `notificationService.createNotifications()` with `channel: "email"`. Events handled:
- `order.placed`, `order.completed`, `order.canceled`
- `order.fulfillment_created` (shipment)
- `auth.password_reset`
- `user.created` (admin invite)

### Admin UI (`src/admin/`)
- Settings page at `/settings/smtp` — React form using `@medusajs/ui` + `@tanstack/react-query`. Allows configuring SMTP and sending test emails. Uses `@medusajs/js-sdk` for API calls (`src/admin/lib/sdk.ts`).

## Consumer Configuration

The consuming Medusa project must register the provider with `channels: ["email"]` in their notification module config. No SMTP credentials are needed in config — everything is read from the DB (Admin UI). Only `channels: ["email"]` is required, otherwise `createNotifications({ channel: "email" })` will throw "Could not find a notification provider for channel: email".

## Key Quirks

- `tls: { rejectUnauthorized: false }` is set on all transporter instances — intentional for shared hosting compatibility.
- The `PostSmtpConfigSchema` Zod schema uses `.passthrough().transform()` to strip `id`, `created_at`, etc. from the request body before saving.
- Template names are dual-registered (kebab + dot notation) in `templates/index.ts` for compatibility with different Medusa event naming conventions.
