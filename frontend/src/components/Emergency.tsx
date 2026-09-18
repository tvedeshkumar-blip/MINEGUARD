import React from 'react';
import styles from './Emergency.module.css';

const STEPS = [
  {
    step: '01',
    title: 'Hazard Detected',
    description: 'Sensors detect dangerous gas levels, seismic activity, or equipment failure. System validates alert in under 500ms.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Alert Broadcast',
    description: 'Simultaneous alerts via underground sirens, wearable device vibration, surface PA system, and emergency SMS to all personnel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 23 17z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Workers Evacuate',
    description: "MINEGUARD’s evacuation maps guide workers to the nearest refuge chamber or exit route via their wearable displays.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Rescue Dispatched',
    description: 'Rescue teams receive real-time zone maps, worker last-known locations, and environmental conditions for safe entry planning.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

const Emergency: React.FC = () => (
  <section className={`section ${styles.section}`} id="emergency" aria-labelledby="emergency-heading">
    {/* Background */}
    <div className={styles.bg} aria-hidden="true" />
    <div className={styles.bgGlow} aria-hidden="true" />

    <div className="container">
      <div className={styles.inner}>
        {/* Left column */}
        <div className={styles.content}>
          <span className={`badge badge--danger`}>Emergency Response</span>
          <h2 id="emergency-heading" className={styles.title}>
            When Seconds Matter,{' '}
            <span className={styles.highlight}>We're Ready</span>
          </h2>
          <p className={styles.desc}>
            MINEGUARD's emergency response system activates within milliseconds of
            detecting a hazard. Every second of response time is engineered to save lives —
            from automated alerts to rescue team coordination.
          </p>
          <div className={styles.callout}>
            <div className={styles.calloutIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className={styles.calloutTitle}>Average response time</div>
              <div className={styles.calloutValue}>Under 8 seconds</div>
            </div>
          </div>
          <button id="emergency-learn-more" className={`btn btn--danger btn--lg`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            See Emergency Protocols
          </button>
        </div>

        {/* Right column — steps */}
        <div className={styles.steps}>
          {STEPS.map((s, i) => (
            <div key={s.step} className={styles.stepCard}>
              <div className={styles.stepNumber}>{s.step}</div>
              <div className={styles.stepConnector} aria-hidden="true">
                {i < STEPS.length - 1 && <div className={styles.connectorLine} />}
              </div>
              <div className={styles.stepBody}>
                <div className={styles.stepIcon}>{s.icon}</div>
                <div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default Emergency;
