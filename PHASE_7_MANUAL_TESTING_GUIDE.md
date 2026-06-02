# Phase 7 Manual Testing Guide
## Email Infrastructure + Auth Hardening

---

## 1. Complete File List

### New Files Created
- `src/config/email.config.ts` - Email configuration
- `src/modules/email/email.module.ts` - Email module definition
- `src/modules/email/email.service.ts` - Email service with Resend integration
- `src/modules/email/templates/verify-email.template.ts` - Email verification HTML template
- `src/modules/email/templates/reset-password.template.ts` - Password reset HTML template
- `src/modules/auth/utils/cookie.util.ts` - Cookie options utility helper

### Modified Files
- `src/types/env.types.ts` - Added APP_URL, FRONTEND_URL, RESEND_API_KEY, EMAIL_FROM
- `src/config/environment.validation.ts` - Added validation for new env variables
- `src/config/index.ts` - Added email config to configuration array
- `src/modules/auth/auth.module.ts` - Imported EmailModule
- `src/modules/auth/auth.service.ts` - Integrated EmailService, extended audit logging
- `src/modules/auth/auth.controller.ts` - Updated to pass Request for audit logging
- `.env.example` - Added new environment variables

---

## 2. Required NPM Installs

```bash
npm install resend
```

This installs the Resend SDK for email sending.

---

## 3. Required Environment Variables

Add these to your `.env` file:

```env
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

### Variable Descriptions
- `APP_URL` - Your backend API URL
- `FRONTEND_URL` - Your frontend application URL (used for email links)
- `RESEND_API_KEY` - Your Resend API key (get from resend.com)
- `EMAIL_FROM` - The email address to send emails from (must be verified in Resend)

---

## 4. Resend Setup Instructions

### Step 1: Create Resend Account
1. Go to https://resend.com
2. Sign up for an account
3. Verify your email address

### Step 2: Get API Key
1. Navigate to API Keys section in Resend dashboard
2. Create a new API key
3. Copy the API key (starts with `re_`)
4. Add it to your `.env` file as `RESEND_API_KEY`

### Step 3: Verify Sender Domain
1. Go to Domains section in Resend dashboard
2. Add your domain (e.g., `yourdomain.com`)
3. Add the DNS records provided by Resend to your domain's DNS
4. Wait for DNS propagation (usually 5-10 minutes)
5. Once verified, you can send emails from this domain

**For Development:**
- You can use Resend's default domain `@resend.dev` for testing
- Update `EMAIL_FROM` to `your-name@resend.dev`

---

## 5. Manual Postman Testing Steps

### Test 1: User Registration
```http
POST http://localhost:3000/auth/sign-up
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "USER",
    "status": "PENDING_VERIFICATION",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test 2: Send Verification Email
```http
POST http://localhost:3000/auth/send-verification-email
Authorization: Bearer <access_token_from_test_1>
```

**Expected Response:**
```json
{
  "success": true
}
```

**Verify:** Check your email (or Resend dashboard) for the verification email.

### Test 3: Verify Email
Use the token from the email received in Test 2.

```http
POST http://localhost:3000/auth/verify-email
Content-Type: application/json

{
  "token": "<token_from_email>"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

### Test 4: Login
```http
POST http://localhost:3000/auth/sign-in
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "USER",
    "status": "ACTIVE",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### Test 5: Forgot Password
```http
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

**Note:** Response is always `{ "success": true }` even if email doesn't exist (security feature).

**Verify:** Check your email for the password reset email.

### Test 6: Reset Password
Use the token from the email received in Test 5.

```http
POST http://localhost:3000/auth/reset-password
Content-Type: application/json

{
  "token": "<token_from_email>",
  "password": "NewSecurePass456!"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

### Test 7: Logout
```http
POST http://localhost:3000/auth/logout
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

**Expected Response:**
```json
{
  "success": true
}
```

### Test 8: Logout All
```http
POST http://localhost:3000/auth/logout-all
Authorization: Bearer <access_token>
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## 6. Security Review Summary

### ✅ Security Measures Verified

#### 1. No Refresh Token Leaked from Database
- **Status:** PASS
- **Implementation:** Refresh tokens are hashed using bcrypt before storage
- **Verification:** `findValidStoredRefreshToken` only returns `{ id }`, never the token hash
- **Location:** `src/modules/auth/auth.service.ts:442-463`

#### 2. No Password Hash Exposed
- **Status:** PASS
- **Implementation:** `toSafeUser()` method excludes passwordHash
- **Verification:** All user responses use SafeUser type which excludes sensitive fields
- **Location:** `src/modules/auth/auth.service.ts:486-497`

#### 3. No Token Leaks in Logs
- **Status:** PASS
- **Implementation:** EmailService logs only email addresses, not tokens
- **Verification:** Logger statements in EmailService do not include tokens
- **Location:** `src/modules/email/email.service.ts:28, 44`

#### 4. No Sensitive Information in Responses
- **Status:** PASS
- **Implementation:** All responses use typed interfaces (SafeUser, AuthResponse)
- **Verification:** passwordHash, failedLoginAttempts, lockedUntil never exposed
- **Location:** `src/modules/auth/types/auth-response.type.ts`

#### 5. Audit Logging Enhanced
- **Status:** PASS
- **Implementation:** ipAddress and userAgent now stored in metadata
- **Applied to:** LOGIN_SUCCESS, LOGIN_FAILED, PASSWORD_RESET, EMAIL_VERIFIED, LOGOUT, LOGOUT_ALL
- **Location:** `src/modules/auth/auth.service.ts`

#### 6. Cookie Hardening
- **Status:** PASS
- **Implementation:** Created `getRefreshCookieOptions()` utility
- **Features:** httpOnly, secure (production), sameSite: 'lax', path: '/auth'
- **Location:** `src/modules/auth/utils/cookie.util.ts`

#### 7. Email Security
- **Status:** PASS
- **Implementation:** forgotPassword never reveals if account exists
- **Verification:** Always returns success regardless of user existence
- **Location:** `src/modules/auth/auth.service.ts:286-288`

#### 8. Token Expiration
- **Status:** PASS
- **Implementation:** Email verification tokens expire in 24 hours
- **Implementation:** Password reset tokens expire in 1 hour
- **Location:** `src/modules/auth/auth.service.ts:225, 291`

### Existing Protections Maintained
- ✅ RBAC (Role-Based Access Control)
- ✅ Account Lockout (5 failed attempts = 15 min lock)
- ✅ Rate Limiting (ThrottlerGuard on sensitive endpoints)
- ✅ Session Management
- ✅ Refresh Token Rotation
- ✅ JWT Access Tokens with expiration

---

## 7. Email Template Features

### Verification Email Template
- Responsive layout
- Dark theme compatible
- Includes greeting with user's name
- Verify email button
- Fallback URL for copy-paste
- Expiration notice (24 hours)
- Clean SaaS-style design

### Password Reset Email Template
- Responsive layout
- Dark theme compatible
- Includes greeting with user's name
- Reset password button
- Fallback URL for copy-paste
- Expiration notice (1 hour)
- Security warning about unauthorized requests
- Clean SaaS-style design

---

## 8. Troubleshooting

### Email Not Sending
1. Verify RESEND_API_KEY is correct
2. Check Resend dashboard for API errors
3. Ensure EMAIL_FROM domain is verified in Resend
4. Check application logs for EmailService errors

### Environment Validation Errors
1. Ensure all new env variables are set in `.env`
2. Check variable names match exactly (case-sensitive)
3. Restart application after updating `.env`

### Audit Logging Missing IP/User Agent
1. Ensure Request object is passed to service methods
2. Check that controller methods include `@Req() request: Request`
3. Verify proxy settings if running behind reverse proxy

---

## 9. Production Checklist

Before deploying to production:

- [ ] Update `APP_URL` to production backend URL
- [ ] Update `FRONTEND_URL` to production frontend URL
- [ ] Use verified domain in `EMAIL_FROM` (not @resend.dev)
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (not the example values)
- [ ] Configure reverse proxy to forward real IP addresses
- [ ] Enable HTTPS (cookie `secure` flag requires HTTPS)
- [ ] Test email delivery with production domain
- [ ] Review and adjust rate limiting limits
- [ ] Set up monitoring for email delivery failures
- [ ] Configure database backups
- [ ] Review audit log retention policy

---

## 10. Summary

Phase 7 successfully implements:
- ✅ Email module with Resend integration
- ✅ Email verification and password reset emails
- ✅ Responsive, dark-theme compatible email templates
- ✅ Cookie hardening utility
- ✅ Enhanced audit logging with IP and user agent
- ✅ Configuration validation for new environment variables
- ✅ All existing security protections maintained
- ✅ No sensitive data leaks in responses or logs

The authentication system is now production-ready with email-based workflows.
