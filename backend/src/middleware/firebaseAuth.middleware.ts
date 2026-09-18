import type { Request, Response, NextFunction } from 'express';
import { adminAuth, isAdminInitialized } from '../firebase/admin.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
}

/**
 * Express Middleware to verify Firebase ID Tokens.
 * @param required - If true, returns 401 when token is missing or invalid. If false, passes through.
 */
export const verifyFirebaseToken = (required: boolean = false) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        return res.status(401).json({ error: 'Unauthorized: Missing or malformed Bearer token.' });
      }
      return next();
    }

    const token = authHeader.split('Bearer ')[1];

    if (!isAdminInitialized || !adminAuth) {
      // Admin SDK not initialized (demo mode fallback)
      if (required) {
        console.warn('[AUTH MIDDLEWARE] Required auth requested, but Firebase Admin SDK is not initialized.');
        return res.status(401).json({ error: 'Unauthorized: Firebase Admin SDK is offline.' });
      }
      return next();
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'SAFETY_OFFICER',
        ...decodedToken
      };
      return next();
    } catch (error: any) {
      console.error('[AUTH MIDDLEWARE] Token verification failed:', error.message);
      if (required) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired Firebase token.' });
      }
      return next();
    }
  };
};
