import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthContextValue, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { isFirebaseConfigured } from '../firebase/firebase';
import { loginWithFirebase, logoutFirebase, subscribeToAuthState, getCurrentUserToken } from '../firebase/auth';
import { getUserProfileFromFirestore } from '../firebase/firestore';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check stored local session or listen to Firebase Auth
  useEffect(() => {
    let unsubscribeFirebase: (() => void) | null = null;

    const storedUser = localStorage.getItem('mg_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('[AUTH] Failed to parse stored user:', e);
      }
    }

    if (isFirebaseConfigured()) {
      unsubscribeFirebase = subscribeToAuthState(async (fbUser) => {
        if (fbUser) {
          const token = await getCurrentUserToken();
          const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
          
          const role: UserRole = firestoreProfile?.role || 'SAFETY_OFFICER';
          const name = firestoreProfile?.displayName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Mine Operator';

          const mappedUser: User = {
            id: fbUser.uid,
            name: name,
            email: fbUser.email || '',
            role: role,
            site: 'Appalachian Deep-Shaft Mine #4',
            avatarInitials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'MO',
            firebaseUid: fbUser.uid,
            token: token || undefined,
            isFirebaseUser: true,
          };

          setUser(mappedUser);
          localStorage.setItem('mg_user', JSON.stringify(mappedUser));
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeFirebase) unsubscribeFirebase();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // 1. Attempt Firebase Auth if configured
    if (isFirebaseConfigured()) {
      try {
        const fbUser = await loginWithFirebase(email, password);
        const token = await getCurrentUserToken();
        const firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
        
        const role: UserRole = firestoreProfile?.role || 'SAFETY_OFFICER';
        const name = firestoreProfile?.displayName || fbUser.displayName || email.split('@')[0];

        const mappedUser: User = {
          id: fbUser.uid,
          name: name,
          email: fbUser.email || email,
          role: role,
          site: 'Appalachian Deep-Shaft Mine #4',
          avatarInitials: name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'MO',
          firebaseUid: fbUser.uid,
          token: token || undefined,
          isFirebaseUser: true,
        };

        setUser(mappedUser);
        localStorage.setItem('mg_user', JSON.stringify(mappedUser));
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        console.warn('[AUTH] Firebase login failed, attempting local demo fallback:', err?.message || err);
      }
    }

    // 2. Fallback to Mock Verification
    await new Promise((resolve) => setTimeout(resolve, 500));
    const foundUser = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser && password === 'demo1234') {
      setUser(foundUser);
      localStorage.setItem('mg_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Invalid credentials. For demo mode use demo accounts with password: demo1234' };
  };

  const logout = async () => {
    if (isFirebaseConfigured()) {
      await logoutFirebase();
    }
    setUser(null);
    localStorage.removeItem('mg_user');
    window.location.hash = '/';
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
