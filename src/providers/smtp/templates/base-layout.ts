export function baseLayout(content: string, storeName?: string): string {
  const name = storeName || "Store"

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #f4f4f5; padding: 40px 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { background-color: #18181b; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em; }
    .content { padding: 32px; color: #27272a; font-size: 14px; line-height: 1.6; }
    .content h2 { font-size: 18px; font-weight: 600; color: #18181b; margin: 0 0 16px 0; }
    .content p { margin: 0 0 12px 0; }
    .footer { background-color: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #e4e4e7; }
    .footer p { margin: 0; font-size: 12px; color: #a1a1aa; }
    .btn { display: inline-block; padding: 10px 24px; background-color: #18181b; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500; }
    .table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .table th { text-align: left; padding: 8px 12px; background-color: #fafafa; border-bottom: 1px solid #e4e4e7; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
    .total-row { font-weight: 600; font-size: 16px; }
    .muted { color: #71717a; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td class="header">
          <h1>${name}</h1>
        </td>
      </tr>
      <tr>
        <td class="content">
          ${content}
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`
}
