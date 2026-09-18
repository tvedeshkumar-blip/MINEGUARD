import React from 'react';
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.hero} id="hero" aria-labelledby="hero-heading">
      {/* Background grid */}
      <div className={styles.grid} aria-hidden="true" />

      {/* Ambient glows */}
      <div className={styles.glowOrange} aria-hidden="true" />
      <div className={styles.glowRed} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {/* Left column */}
        <div className={styles.content}>
          <div className={`badge badge--danger ${styles.alertBadge}`}>
            <span className={styles.blink} />
            Live Monitoring Active
          </div>

          <h1 id="hero-heading" className={styles.heading}>
            Keeping Miners{' '}
            <span className={styles.highlight}>Safe</span>{' '}
            Underground
          </h1>

          <p className={styles.subheading}>
            MINEGUARD is an advanced real-time monitoring and emergency rescue
            coordination platform — protecting underground mine workers with
            intelligent gas detection, seismic alerts, and instant rescue dispatch.
          </p>

          <div className={styles.ctaGroup}>
            <button
              id="hero-cta-primary"
              className={`btn btn--primary btn--lg ${styles.ctaPrimary}`}
              onClick={() => scrollTo('#features')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Explore Safety Features
            </button>
            <button
              id="hero-cta-demo"
              className={`btn btn--secondary btn--lg`}
              onClick={() => scrollTo('#safety')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              View Live Dashboard
            </button>
          </div>

          {/* Trust indicators */}
          <div className={styles.trust}>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>ISO 45001 Compliant</span>
            </div>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>MSHA Approved</span>
            </div>
            <div className={styles.trustItem}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Right column – dashboard preview */}
        <div className={styles.visual} aria-label="MINEGUARD dashboard preview">
          <div className={styles.dashCard}>
            {/* Status header */}
            <div className={styles.dashHeader}>
              <div className={styles.dashStatus}>
                <span className={`${styles.statusDot} ${styles.statusGreen}`} />
                <span>System Online</span>
              </div>
              <span className={styles.dashTime}>08:37 AM</span>
            </div>

            {/* Alert banner */}
            <div className={styles.alertBanner}>
              <div className={styles.alertIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <div className={styles.alertTitle}>CO Level Alert — Zone B4</div>
                <div className={styles.alertSub}>35 ppm detected · Rescue team dispatched</div>
              </div>
              <span className={`badge badge--danger`}>LIVE</span>
            </div>

            {/* Sensor grid */}
            <div className={styles.sensorGrid}>
              {SENSORS.map((s) => (
                <div key={s.label} className={`${styles.sensorCard} ${s.alert ? styles.sensorAlert : ''}`}>
                  <div className={styles.sensorLabel}>{s.label}</div>
                  <div className={styles.sensorValue} style={{ color: s.color }}>
                    {s.value}
                    <span className={styles.sensorUnit}>{s.unit}</span>
                  </div>
                  <div className={styles.sensorBar}>
                    <div
                      className={styles.sensorBarFill}
                      style={{ width: s.percent + '%', background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Worker tracker */}
            <div className={styles.workerRow}>
              <span className={styles.workerLabel}>Active Workers</span>
              <div className={styles.workerAvatars}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={styles.avatar}
                    style={{ background: AVATAR_COLORS[i] }}
                    title={`Worker ${i + 1}`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <div className={`${styles.avatar} ${styles.avatarMore}`}>+42</div>
              </div>
              <span className={styles.workerCount}>48 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator} aria-hidden="true">
        <span />
      </div>
    </section>
  );
};

const SENSORS = [
  { label: 'CO Level',    value: '35',  unit: 'ppm',  percent: 70,  color: '#ef4444', alert: true  },
  { label: 'O₂ Level',   value: '20.3',unit: '%',    percent: 85,  color: '#22c55e', alert: false },
  { label: 'CH₄ Level',  value: '0.8', unit: '%LEL', percent: 16,  color: '#3b82f6', alert: false },
  { label: 'Temperature', value: '31',  unit: '°C',   percent: 62,  color: '#fbbf24', alert: false },
];

const AVATAR_COLORS = [
  '#f97316', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#fbbf24',
];

export default Hero;
