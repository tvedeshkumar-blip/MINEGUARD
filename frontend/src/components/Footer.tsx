import React from 'react';
import styles from './Footer.module.css';

const LINKS = {
  Product: ['Features', 'Dashboard', 'Emergency Response', 'Analytics', 'Integrations', 'Pricing'],
  Company:  ['About Us', 'Case Studies', 'News', 'Careers', 'Partners'],
  Support:  ['Documentation', 'API Reference', 'Training', 'Status Page', 'Contact'],
  Legal:    ['Privacy Policy', 'Terms of Service', 'Security', 'Compliance'],
};

const Footer: React.FC = () => (
  <footer className={styles.footer} id="footer">
    {/* CTA Banner */}
    <div className={styles.ctaBanner}>
      <div className="container">
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to Protect Your Mine?
            </h2>
            <p className={styles.ctaDesc}>
              Join 250+ mining operations worldwide trusting MINEGUARD to
              keep their workers safe. Get started with a free site assessment.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <button id="footer-cta-primary" className={`btn btn--primary btn--lg`}>
              Request Free Demo
            </button>
            <button id="footer-cta-contact" className={`btn btn--secondary btn--lg`}>
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Main footer */}
    <div className={styles.main}>
      <div className="container">
        <div className={styles.top}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg width="32" height="32" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" fill="url(#footerLogoGrad)" />
                <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" fill="rgba(0,0,0,0.4)" />
                <path d="M14 11.5L11 13.25V16.75L14 18.5L17 16.75V13.25L14 11.5Z" fill="#fff" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="footerLogoGrad" x1="3" y1="2" x2="25" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f97316" /><stop offset="1" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.logoText}>
                MINE<span className={styles.logoAccent}>GUARD</span>
              </span>
            </div>
            <p className={styles.brandDesc}>
              Advanced mine rescue and worker safety system — protecting underground
              workers with real-time monitoring, intelligent alerts, and emergency coordination.
            </p>
            <div className={styles.socials}>
              {/* LinkedIn */}
              <a href="#" className={styles.social} aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              {/* Twitter/X */}
              <a href="#" className={styles.social} aria-label="Twitter/X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* GitHub */}
              <a href="#" className={styles.social} aria-label="GitHub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div className={styles.linkColumns}>
            {Object.entries(LINKS).map(([category, links]) => (
              <div key={category} className={styles.linkCol}>
                <h3 className={styles.colTitle}>{category}</h3>
                <ul className={styles.colList}>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className={styles.colLink}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} MINEGUARD Systems. All rights reserved.
          </p>
          <div className={styles.bottomBadges}>
            <span className={`badge badge--success`}>ISO 45001</span>
            <span className={`badge badge--info`}>MSHA Approved</span>
            <span className={`badge badge--primary`}>CE Certified</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
