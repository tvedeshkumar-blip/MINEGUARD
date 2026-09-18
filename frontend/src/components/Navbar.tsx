import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Safety System', href: '#safety' },
  { label: 'Statistics', href: '#statistics' },
  { label: 'Emergency', href: '#emergency' },
  { label: 'Contact', href: '#footer' },
];

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="#" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <span className={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" fill="url(#logoGrad)" />
              <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" fill="rgba(0,0,0,0.4)" />
              <path d="M14 11.5L11 13.25V16.75L14 18.5L17 16.75V13.25L14 11.5Z" fill="#fff" fillOpacity="0.9" />
              <defs>
                <linearGradient id="logoGrad" x1="3" y1="2" x2="25" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f97316" />
                  <stop offset="1" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className={styles.logoText}>
            MINE<span className={styles.logoAccent}>GUARD</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  className={styles.navLink}
                  onClick={() => handleNavClick(link.href)}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA */}
        <div className={styles.actions}>
          <button 
            className={`btn btn--secondary ${styles.loginBtn}`}
            onClick={() => window.location.hash = '/login'}
          >
            Login
          </button>
          <button 
            className={`btn btn--primary`}
            onClick={() => window.location.hash = '/login'}
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} aria-hidden={!menuOpen}>
        <nav>
          <ul className={styles.mobileList}>
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button className={styles.mobileLink} onClick={() => handleNavClick(link.href)}>
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className={styles.mobileActions}>
            <button 
              className={`btn btn--secondary`} 
              style={{ width: '100%' }}
              onClick={() => {
                setMenuOpen(false);
                window.location.hash = '/login';
              }}
            >
              Login
            </button>
            <button 
              className={`btn btn--primary`} 
              style={{ width: '100%' }}
              onClick={() => {
                setMenuOpen(false);
                window.location.hash = '/login';
              }}
            >
              Get Started
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
