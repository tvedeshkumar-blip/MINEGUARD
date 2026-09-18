import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../db/database.js';
import { adminAuth, isAdminInitialized } from '../firebase/admin.js';
import { logAuditToFirestore } from '../firebase/firestoreSync.js';

export const authRouter = Router();

// POST /api/auth/login (Local/Mock authentication)
authRouter.post('/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and password are required' });
    return;
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as Record<string, unknown> | undefined;

  if (!user || password !== 'demo1234') {
    res.status(401).json({ success: false, error: 'Invalid email or password (Demo pass: demo1234)' });
    return;
  }

  logAuditToFirestore({
    userId: user.id as string,
    action: 'USER_LOGIN_MOCK',
    resource: 'users',
    metadata: { email: user.email, role: user.role }
  });

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      site: user.site,
      avatarInitials: user.avatarInitials
    }
  });
});

// POST /api/auth/verify-token (Firebase Token Verification & Audit Log)
authRouter.post('/verify-token', async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ success: false, error: 'idToken is required' });
    return;
  }

  if (!isAdminInitialized || !adminAuth) {
    res.json({
      success: true,
      verified: false,
      message: 'Firebase Admin SDK is not active on backend; operating in local mode.'
    });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    logAuditToFirestore({
      userId: decodedToken.uid,
      action: 'USER_LOGIN_FIREBASE',
      resource: 'users',
      metadata: { email: decodedToken.email }
    });

    res.json({
      success: true,
      verified: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'SAFETY_OFFICER'
      }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, error: 'Invalid token: ' + error.message });
  }
});

// GET /api/auth/users
authRouter.get('/users', (_req: Request, res: Response): void => {
  const users = db.prepare('SELECT id, name, email, role, site, avatarInitials FROM users').all();
  res.json({ success: true, data: users });
});
