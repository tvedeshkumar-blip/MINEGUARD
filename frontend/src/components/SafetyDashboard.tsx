import React from 'react';
import styles from './SafetyDashboard.module.css';

/* Mini map zones */
const ZONES = [
  { id: 'A1', x: 12,  y: 14, status: 'safe',    workers: 12 },
  { id: 'B2', x: 42,  y: 14, status: 'safe',    workers: 8  },
  { id: 'C3', x: 72,  y: 14, status: 'warning', workers: 6  },
  { id: 'A2', x: 12,  y: 44, status: 'safe',    workers: 9  },
  { id: 'B4', x: 42,  y: 44, status: 'danger',  workers: 5  },
  { id: 'C4', x: 72,  y: 44, status: 'offline', workers: 0  },
  { id: 'A3', x: 12,  y: 74, status: 'safe',    workers: 7  },
  { id: 'B5', x: 42,  y: 74, status: 'safe',    workers: 11 },
  { id: 'C5', x: 72,  y: 74, status: 'safe',    workers: 4  },
];

const STATUS_COLORS: Record<string, string> = {
  safe:    '#22c55e',
  warning: '#fbbf24',
  danger:  '#ef4444',
  offline: '#475569',
};

const EVENTS = [
  { time: '08:34', type: 'danger',  msg: 'CO spike detected – Zone B4 (35ppm)' },
  { time: '08:31', type: 'warning', msg: 'Temperature rising – Zone C3 (34°C)' },
  { time: '08:28', type: 'info',    msg: 'Rescue team Alpha dispatched to B4' },
  { time: '08:22', type: 'success', msg: 'Zone A2 air quality normalized' },
  { time: '08:15', type: 'info',    msg: 'Shift B check-in complete — 48 workers' },
];

const EVENT_ICONS: Record<string, React.ReactNode> = {
  danger: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  warning: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

const SafetyDashboard: React.FC = () => (
  <section className={`section ${styles.section}`} id="safety" aria-labelledby="safety-heading">
    <div className="container">
      {/* Header */}
      <div className={styles.header}>
        <span className={`badge badge--primary`}>Live Dashboard</span>
        <h2 id="safety-heading" className={styles.title}>
          Full Mine-Site Visibility, At a Glance
        </h2>
        <p className={styles.subtitle}>
          Monitor every zone, track every worker, and respond to every hazard from
          MINEGUARD's centralized command dashboard.
        </p>
      </div>

      {/* Dashboard */}
      <div className={styles.dashboard}>
        {/* Sidebar stats */}
        <div className={styles.sidebar}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Workers</div>
            <div className={styles.statValue}>48</div>
            <div className={styles.statSub}>Shift B – Active</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Safe Zones</div>
            <div className={`${styles.statValue} ${styles.textGreen}`}>7/9</div>
            <div className={styles.statSub}>78% coverage</div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAlert}`}>
            <div className={styles.statLabel}>Active Alerts</div>
            <div className={`${styles.statValue} ${styles.textRed}`}>2</div>
            <div className={styles.statSub}>Rescue in progress</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Sensors Online</div>
            <div className={`${styles.statValue} ${styles.textGreen}`}>124</div>
            <div className={styles.statSub}>of 127 total</div>
          </div>
        </div>

        {/* Mine map */}
        <div className={styles.mapArea}>
          <div className={styles.mapHeader}>
            <span className={styles.mapTitle}>Mine Zone Map — Level 3</span>
            <div className={styles.mapLegend}>
              {Object.entries(STATUS_COLORS).map(([k, c]) => (
                <span key={k} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: c }} />
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.map} role="img" aria-label="Mine zone map with safety status">
            {/* Tunnel lines */}
            <svg className={styles.tunnels} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {/* Horizontal tunnels */}
              <line x1="14" y1="26" x2="86" y2="26" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              <line x1="14" y1="56" x2="86" y2="56" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              <line x1="14" y1="86" x2="86" y2="86" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              {/* Vertical tunnels */}
              <line x1="14" y1="14" x2="14" y2="86" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              <line x1="44" y1="14" x2="44" y2="86" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
              <line x1="74" y1="14" x2="74" y2="86" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            </svg>

            {/* Zone nodes */}
            {ZONES.map((z) => (
              <div
                key={z.id}
                className={styles.zoneNode}
                style={{
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  '--zone-color': STATUS_COLORS[z.status],
                } as React.CSSProperties}
                title={`Zone ${z.id}: ${z.status} — ${z.workers} workers`}
              >
                <div className={`${styles.zoneRing} ${z.status === 'danger' ? styles.zoneRingPulse : ''}`} />
                <div className={styles.zoneId}>{z.id}</div>
                {z.workers > 0 && (
                  <div className={styles.zoneWorkers}>{z.workers}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event log */}
        <div className={styles.eventLog}>
          <div className={styles.eventLogTitle}>Live Event Log</div>
          <ul className={styles.eventList}>
            {EVENTS.map((e, i) => (
              <li key={i} className={`${styles.eventItem} ${styles[`event--${e.type}`]}`}>
                <div className={styles.eventIcon}>{EVENT_ICONS[e.type]}</div>
                <div className={styles.eventContent}>
                  <div className={styles.eventMsg}>{e.msg}</div>
                  <div className={styles.eventTime}>{e.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default SafetyDashboard;
