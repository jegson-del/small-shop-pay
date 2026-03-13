<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Contact - SmallShopPay</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; margin: 0; padding: 48px 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

          <!-- Brand header -->
          <tr>
            <td style="padding: 48px 40px 24px; text-align: center;">
              <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a;">
                SmallShopPay
              </p>
              <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; font-weight: 500;">
                New contact form message
              </p>
            </td>
          </tr>

          <!-- Sender info -->
          <tr>
            <td style="padding: 0 40px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #f8fafc; border-radius: 8px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">From</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 600; color: #0f172a;">{{ $fromName }}</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #0a5ed7;"><a href="mailto:{{ $fromEmail }}" style="color: #0a5ed7; text-decoration: none;">{{ $fromEmail }}</a></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Message</p>
              <div style="font-size: 16px; line-height: 1.7; color: #475569; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
                {!! nl2br(e($messageBody)) !!}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                Reply directly to this email to respond to the sender.
              </p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #94a3b8;">
                &copy; {{ date('Y') }} SmallShopPay
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
