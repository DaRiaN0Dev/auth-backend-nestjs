export interface ResetPasswordTemplateParams {
  name: string;
  actionUrl: string;
}

export function resetPasswordTemplate(params: ResetPasswordTemplateParams): string {
  const { name, actionUrl } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 20px;
    }
    @media (prefers-color-scheme: dark) {
      body {
        color: #e0e0e0;
        background-color: #1a1a1a;
      }
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    @media (prefers-color-scheme: dark) {
      .container {
        background-color: #2d2d2d;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 30px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
    }
    .message {
      margin-bottom: 20px;
      color: #666;
    }
    @media (prefers-color-scheme: dark) {
      .message {
        color: #b0b0b0;
      }
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-weight: 600;
      margin: 20px 0;
    }
    .button:hover {
      opacity: 0.9;
    }
    .fallback {
      margin-top: 20px;
      font-size: 14px;
      color: #888;
    }
    @media (prefers-color-scheme: dark) {
      .fallback {
        color: #888;
      }
    }
    .fallback a {
      color: #667eea;
      word-break: break-all;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      font-size: 14px;
      color: #856404;
    }
    @media (prefers-color-scheme: dark) {
      .warning {
        background-color: #5c4a00;
        border-left-color: #ffc107;
        color: #ffd54f;
      }
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    @media (prefers-color-scheme: dark) {
      .footer {
        background-color: #252525;
        color: #888;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p class="greeting">Hi ${name},</p>
      <p class="message">We received a request to reset your password. Click the button below to create a new password.</p>
      <a href="${actionUrl}" class="button">Reset Password</a>
      <p class="fallback">If the button doesn't work, you can also copy and paste this link into your browser:</p>
      <p class="fallback"><a href="${actionUrl}">${actionUrl}</a></p>
      <p class="message" style="margin-top: 20px;">This link will expire in 1 hour.</p>
      <div class="warning">
        <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
      </div>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
