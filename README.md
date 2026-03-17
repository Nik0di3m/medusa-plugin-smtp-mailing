# @nik0di3m/medusa-plugin-smtp-mailing

SMTP email notifications plugin for **Medusa.js v2**. Sends transactional emails via nodemailer with built-in HTML templates and admin UI for SMTP configuration.

## Features

- SMTP configuration stored in database (manageable via Admin UI)
- Admin settings page at `/settings/smtp`
- Built-in HTML email templates (order lifecycle, welcome, password reset)
- Supports all major SMTP providers (Gmail, SendGrid, Mailgun, OVH, etc.)

## Installation

```bash
bun add @nik0di3m/medusa-plugin-smtp-mailing
```

> Requires GitHub Packages registry. Add to `.npmrc`:
> ```
> @nik0di3m:registry=https://npm.pkg.github.com
> //npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
> ```

## Configuration

Add the plugin to `medusa-config.ts`:

```typescript
module.exports = defineConfig({
  // ...
  plugins: [
    {
      resolve: "@nik0di3m/medusa-plugin-smtp-mailing",
      options: {},
    },
  ],
});
```

That's it. The plugin auto-registers its module, provider, subscribers, API routes, and admin UI.

## SMTP Setup

After starting Medusa, go to **Admin → Settings → SMTP** and configure:

| Field | Description | Required |
|-------|-------------|----------|
| Host | SMTP server hostname (e.g. `smtp.gmail.com`) | Yes |
| Port | SMTP port (587 for STARTTLS, 465 for SSL) | Yes |
| User | SMTP username/email | No |
| Password | SMTP password / app password | No |
| From Email | Sender email address | Yes |
| From Name | Sender display name | No |
| Secure | Use TLS/SSL (auto-detected for port 465) | No |
| Enabled | Enable/disable email sending | No |

You can also configure via API:

```bash
# GET current config
curl -X GET http://localhost:9000/admin/smtp-config \
  -H "Authorization: Bearer <token>"

# POST create/update config
curl -X POST http://localhost:9000/admin/smtp-config \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "you@gmail.com",
    "pass": "app-password",
    "from_email": "noreply@yourstore.com",
    "from_name": "Your Store",
    "secure": false,
    "enabled": true
  }'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STORE_URL` | Base URL for password reset links | `http://localhost:8000` |

## Email Templates

The plugin handles these events out of the box:

| Event | Template | Description |
|-------|----------|-------------|
| `order.placed` | order-placed | Order confirmation with itemized table |
| `order.completed` | order-completed | Order completion notification |
| `order.canceled` | order-canceled | Order cancellation notice |
| `order.fulfillment_created` | order-fulfillment-created | Shipment notification with tracking |
| `customer.created` | user-created | Welcome email for new customers |
| `auth.password_reset` | password-reset | Password reset link |

All templates use a responsive HTML layout with dark header and clean design.

## Compatibility

- Medusa.js v2 (>= 2.12.0)
- Node.js >= 20

## License

MIT
