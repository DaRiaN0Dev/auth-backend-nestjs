export interface VerifyEmailTemplateParams {
  name: string;
  actionUrl: string;
}

export function verifyEmailTemplate(
  params: VerifyEmailTemplateParams,
): string {
  const { name, actionUrl } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>

  <style>
    body {
      margin: 0;
      padding: 24px;
      background-color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #111827;
      line-height: 1.6;
    }

    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid #e5e7eb;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
    }

    .header {
      background: linear-gradient(
        135deg,
        #0f172a 0%,
        #1e293b 100%
      );
      padding: 48px 32px;
      text-align: center;
    }

    .brand {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      background: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 18px;
    }

    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 30px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .subtitle {
      margin-top: 12px;
      color: #94a3b8;
      font-size: 15px;
    }

    .content {
      padding: 40px 32px;
    }

    .greeting {
      margin: 0 0 20px;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    }

    .message {
      margin: 0 0 18px;
      color: #4b5563;
      font-size: 15px;
    }

    .card {
      margin: 28px 0;
      padding: 20px;
      border-radius: 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }

    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }

    .button {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 30px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 15px;
    }

    .expiry {
      margin-top: 20px;
      color: #64748b;
      font-size: 14px;
      text-align: center;
    }

    .fallback {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #64748b;
    }

    .fallback a {
      color: #2563eb;
      word-break: break-all;
      text-decoration: none;
    }

    .footer {
      border-top: 1px solid #e5e7eb;
      background: #fafafa;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }

    @media (prefers-color-scheme: dark) {
      body {
        background: #020617;
      }

      .container {
        background: #0f172a;
        border-color: #1e293b;
      }

      .greeting {
        color: #f8fafc;
      }

      .message,
      .expiry,
      .fallback,
      .footer {
        color: #94a3b8;
      }

      .card {
        background: #111827;
        border-color: #1f2937;
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
  <div class="container">

    <div class="header">
      <div class="brand">DaRiaN0Dev</div>

      <h1>Verify Your Email</h1>

      <div class="subtitle">
        Secure account verification
      </div>
    </div>

    <div class="content">

      <p class="greeting">
        Hello ${name},
      </p>

      <p class="message">
        Thank you for creating an account.
      </p>

      <p class="message">
        Please verify your email address to activate your account and gain full access to the platform.
      </p>

      <div class="card">

        <div class="button-wrapper">
          <a href="${actionUrl}" class="button">
            Verify Email Address
          </a>
        </div>

        <div class="expiry">
          This verification link will expire in 24 hours.
        </div>

      </div>

      <div class="fallback">
        <p>
          If the button above does not work, copy and paste this URL into your browser:
        </p>

        <a href="${actionUrl}">
          ${actionUrl}
        </a>
      </div>

    </div>

    <div class="footer">

      <p>
        If you did not create this account, you can safely ignore this email.
      </p>

      <p>
        © 2026 DaRiaN0Dev. All rights reserved.
      </p>

    </div>

  </div>
</body>
</html>
  `.trim();
}