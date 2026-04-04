import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, expectedHash] = stored.split(':');
  if (!salt || !expectedHash) return false;

  const actualHash = scryptSync(password, salt, KEY_LENGTH);
  const expected = Buffer.from(expectedHash, 'hex');

  if (expected.length !== actualHash.length) return false;
  return timingSafeEqual(expected, actualHash);
}
