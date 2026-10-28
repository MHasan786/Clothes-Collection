import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

const SECRET_KEY = process.env.AUTH_SECRET || 'styleora_production_jwt_secret_token_key_2026';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  exp: number;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    const hashBuf = Buffer.from(hash, 'hex');
    const derivedBuf = Buffer.from(derived, 'hex');
    if (hashBuf.length !== derivedBuf.length) return false;
    return crypto.timingSafeEqual(hashBuf, derivedBuf);
  } catch {
    return false;
  }
}

export function generateToken(payload: Omit<TokenPayload, 'exp'>, expiresInHours = 72): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInHours * 3600;
  const fullPayload: TokenPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(encodedPayload)
      .digest('base64url');
    if (signature !== expectedSig) return null;

    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadStr) as TokenPayload;
    if (Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in.' });
    return;
  }
  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
    return;
  }
  req.user = payload;
  next();
}

export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  authenticate(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied: Admin privileges required.' });
      return;
    }
    next();
  });
}
