<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verification Code - SmallShopPay</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #fafafa; margin: 0; padding: 48px 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 480px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

          <!-- Brand header -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <p style="margin: 0; font-size: 36px; font-weight: 700; letter-spacing: -0.02em; color: #0f172a;">
                SmallShopPay
              </p>
              <p style="margin: 12px 0 0; font-size: 14px; color: #64748b; font-weight: 500;">
                Your verification code
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Hello,
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #475569;">
                Use this code to continue:
              </p>

              <!-- OTP Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 28px;">
                <tr>
                  <td align="center">
                    <span style="display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 32px; font-size: 28px; font-weight: 600; letter-spacing: 10px; color: #0f172a; font-family: ui-monospace, monospace;">
                      {{ $otp }}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #64748b;">
                {{ $purpose }}
              </p>

              <p style="margin: 0; font-size: 13px; color: #94a3b8;">
                Code expires in 10 minutes. Do not share it.
              </p>

              <p style="margin: 28px 0 0; font-size: 13px; color: #94a3b8;">
                If you did not request this, ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
              <p style="margin: 0; font-size: 12px; color: #94a3b8;">
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
