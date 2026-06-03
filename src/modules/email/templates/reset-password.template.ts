export interface ResetPasswordTemplateParams {
  name: string;
  actionUrl: string;
}

export function resetPasswordTemplate(
  params: ResetPasswordTemplateParams,
): string {
  const { name, actionUrl } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>

  <style>
    body {
      margin: 0;
      padding: 32px 16px;
      background-color: #f1f5f9;
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.6;
    }

    .wrapper {
      max-width: 600px;
      margin: 0 auto;
    }

    .container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.05),
        0 4px 6px -4px rgba(0, 0, 0, 0.05);
    }

    .header {
      background: linear-gradient(
        135deg,
        #0f172a 0%,
        #1e293b 100%
      );
      padding: 40px 32px;
      text-align: center;
    }

    .brand {
      color: #60a5fa;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-bottom: 14px;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .content {
      padding: 40px 32px;
    }

    .greeting {
      margin: 0 0 20px;
      font-size: 18px;
      font-weight: 600;
      color: #0f172a;
    }

    .message {
      margin: 0 0 18px;
      color: #475569;
      font-size: 15px;
    }

    .card {
      margin: 28px 0;
      padding: 20px;
      border-radius: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }

    .button {
      display: inline-block;
      padding: 14px 32px;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
    }

    .button:hover {
      background: #1d4ed8;
    }

    .expiry {
      margin-top: 24px;
      font-size: 14px;
      color: #64748b;
    }

    .warning {
      margin-top: 24px;
      padding: 16px;
      border-radius: 12px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      color: #9a3412;
      font-size: 14px;
    }

    .fallback {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }

    .fallback p {
      margin: 0 0 12px;
      font-size: 14px;
      color: #64748b;
    }

    .fallback a {
      color: #ffffff;
      text-decoration: none;
      word-break: break-all;
    }

    .footer {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px;
      text-align: center;
    }

    .footer p {
      margin: 6px 0;
      font-size: 12px;
      color: #64748b;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #020617;
      }

      .container {
        background: #0f172a;
        border-color: #1e293b;
      }

      .card {
        background: #111827;
        border-color: #1f2937;
      }

      .greeting {
        color: #f8fafc;
      }

      .message,
      .expiry,
      .fallback p,
      .footer p {
        color: #94a3b8;
      }

      .warning {
        background: rgba(251, 146, 60, 0.12);
        border-color: rgba(251, 146, 60, 0.3);
        color: #fdba74;
      }

      .footer {
        background: #020617;
        border-top-color: #1e293b;
      }

      .fallback {
        border-top-color: #1e293b;
      }
    }
  </style>
</head>

<body>
  <div class="wrapper">
    <div class="container">

      <div class="header">
        <div class="brand">DaRiaN0Dev</div>
        <h1>Reset Password</h1>
      </div>

      <div class="content">

        <p class="greeting">
          Hello ${name},
        </p>

        <p class="message">
          We received a request to reset the password associated with your account.
        </p>

        <div class="card">
          <p class="message" style="margin: 0;">
            Click the button below to choose a new password and regain access to your account.
          </p>
        </div>

        <div class="button-wrapper">
          <a href="${actionUrl}" class="button">
            Reset Password
          </a>
        </div>

        <p class="expiry">
          This password reset link will expire in 1 hour.
        </p>

        <div class="warning">
          <strong>Security Notice:</strong><br />
          If you did not request a password reset, you can safely ignore this email.
          Your account remains secure and no changes will be made.
        </div>

        <div class="fallback">
          <p>
            If the button above does not work, copy and paste this link into your browser:
          </p>

          <a href="${actionUrl}">
            ${actionUrl}
          </a>
        </div>

      </div>

      <div class="footer">
        <p>
          This email was sent automatically. Please do not reply directly to this message.
        </p>

        <p>
          © 2026 DaRiaN0Dev. All rights reserved.
        </p>
      </div>

    </div>
  </div>
</body>
</html>
  `.trim();
}
