import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './LoginPage.module.css';
import { DEMO_USERS } from '../data/mockData';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    const result = await login(email, password);
    if (result.success) {
      window.location.hash = '/dashboard';
    } else {
      setError(result.error || 'Login failed.');
    }
  };

  const autofill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo1234');
    setError(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.bgGlow} aria-hidden="true" />
      
      <div className={styles.backLink}>
        <button onClick={() => window.location.hash = '/'} className={styles.backBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Landing Page
        </button>
      </div>

      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <svg width="40" height="40" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" fill="url(#logoGradLogin)" />
              <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" fill="rgba(0,0,0,0.4)" />
              <path d="M14 11.5L11 13.25V16.75L14 18.5L17 16.75V13.25L14 11.5Z" fill="#fff" fillOpacity="0.9" />
              <defs>
                <linearGradient id="logoGradLogin" x1="3" y1="2" x2="25" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f97316" />
                  <stop offset="1" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className={styles.title}>MINEGUARD Ops Portal</h1>
          <p className={styles.subtitle}>Sign in to access the safety dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.errorBox}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@mineguard.demo"
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className={`btn btn--primary ${styles.submitBtn}`} disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className={styles.demoSection}>
          <div className={styles.demoHeader}>
            <span className={styles.demoLine}></span>
            <span className={styles.demoTitle}>Demo Credentials</span>
            <span className={styles.demoLine}></span>
          </div>
          <div className={styles.demoList}>
            {DEMO_USERS.map(user => (
              <button
                key={user.id}
                type="button"
                className={styles.demoAccountBtn}
                onClick={() => autofill(user.email)}
              >
                <div className={styles.demoRole}>{user.role.replace('_', ' ')}</div>
                <div className={styles.demoEmail}>{user.email}</div>
              </button>
            ))}
            <div className={styles.demoHint}>Password for all demo accounts: <strong>demo1234</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
