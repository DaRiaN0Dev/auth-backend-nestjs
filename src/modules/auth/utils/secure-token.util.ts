import { randomBytes } from 'crypto';

export function generateSecureToken(): string {
  // 48 bytes -> 64 chars base64url (no padding), 384-bit entropy.
  return randomBytes(48).toString('base64url');
}
