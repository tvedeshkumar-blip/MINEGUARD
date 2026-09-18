import React from 'react';
import styles from './Features.module.css';

interface Feature {
  icon: React.ReactNode;
  badge: string;
  badgeType: string;
  title: string;
  description: string;
  highlights: string[];
}

const FEATURES: Feature[] = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
    badge: 'Real-Time',
    badgeType: 'danger',
    title: 'Live Sensor Monitoring',
    description: 'Continuous monitoring of CO, CH₄, O₂, temperature, and humidity across all mine zones with sub-second alert latency.',
    highlights: ['Gas detection < 500ms', 'Multi-zone coverage', 'Wireless sensor mesh'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    badge: 'Tracking',
    badgeType: 'info',
    title: 'Worker Location Tracking',
    description: 'GPS and RFID-based real-time location tracking for every worker, with zone-level precision and headcount verification.',
    highlights: ['RFID tag integration', 'Zone-based headcount', 'Emergency muster alerts'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    badge: 'Emergency',
    badgeType: 'danger',
    title: 'Emergency Alert System',
    description: 'Multi-channel alerting via siren, SMS, radio, and in-app notifications with automated rescue team dispatch.',
    highlights: ['Multi-channel alerts', 'Auto rescue dispatch', 'Escalation protocols'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
    ),
    badge: 'Analytics',
    badgeType: 'primary',
    title: 'Safety Analytics Dashboard',
    description: 'Comprehensive reporting and trend analysis — incident history, near-miss logging, shift safety scores, and regulatory compliance.',
    highlights: ['Incident trend analysis', 'Compliance reporting', 'Shift safety scores'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    badge: 'Rescue',
    badgeType: 'primary',
    title: 'Rescue Team Coordination',
    description: 'Integrated rescue operations management with team assignment, equipment tracking, and communication relay into deep mine shafts.',
    highlights: ['Team assignment', 'Equipment checklist', 'Deep-shaft comms relay'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    badge: 'Compliance',
    badgeType: 'success',
    title: 'Regulatory Compliance',
    description: 'Built-in MSHA, ISO 45001, and local mining regulation frameworks with auto-generated audit trails and inspection reports.',
    highlights: ['MSHA compliance', 'ISO 45001 framework', 'Auto audit trails'],
  },
];

const badgeClassMap: Record<string, string> = {
  danger:  'badge--danger',
  info:    'badge--info',
  primary: 'badge--primary',
  success: 'badge--success',
};

const Features: React.FC = () => (
  <section className={`section ${styles.features}`} id="features" aria-labelledby="features-heading">
    <div className="container">
      {/* Section header */}
      <div className={styles.header}>
        <span className={`badge badge--primary`}>Platform Features</span>
        <h2 id="features-heading" className={styles.title}>
          Every Tool to Keep Your Miners Safe
        </h2>
        <p className={styles.subtitle}>
          From real-time underground sensor data to emergency rescue coordination,
          MINEGUARD gives safety officers complete command of mine operations.
        </p>
      </div>

      {/* Feature grid */}
      <div className={styles.grid}>
        {FEATURES.map((f) => (
          <article key={f.title} className={styles.card}>
            <div className={styles.cardIconWrap}>
              <div className={styles.cardIcon}>{f.icon}</div>
            </div>
            <div className={`badge ${badgeClassMap[f.badgeType]} ${styles.cardBadge}`}>{f.badge}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.description}</p>
            <ul className={styles.highlights}>
              {f.highlights.map((h) => (
                <li key={h} className={styles.highlightItem}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {h}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
