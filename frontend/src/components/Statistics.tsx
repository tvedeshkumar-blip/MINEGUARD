import React, { useEffect, useRef, useState } from 'react';
import styles from './Statistics.module.css';

interface Stat {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  sublabel: string;
  color: string;
}

const STATS: Stat[] = [
  {
    value: 99.9,
    suffix: '%',
    label: 'System Uptime',
    sublabel: 'Industry-leading reliability',
    color: 'var(--success)',
  },
  {
    value: 8,
    suffix: 's',
    label: 'Avg. Alert Response',
    sublabel: 'From detection to action',
    color: 'var(--danger)',
  },
  {
    value: 250,
    suffix: '+',
    label: 'Mine Sites Protected',
    sublabel: 'Across 18 countries',
    color: 'var(--primary)',
  },
  {
    value: 48000,
    suffix: '+',
    label: 'Workers Monitored',
    sublabel: 'Daily active monitoring',
    color: 'var(--info)',
  },
  {
    value: 127,
    suffix: 'M',
    prefix: '',
    label: 'Sensor Readings / Day',
    sublabel: 'Continuous data pipeline',
    color: 'var(--accent)',
  },
  {
    value: 0,
    suffix: '',
    label: 'Fatal Incidents Missed',
    sublabel: 'Since platform launch',
    color: 'var(--success)',
  },
];

function useCountUp(target: number, duration = 2000, active: boolean) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const isDecimal = target % 1 !== 0;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;
      setCount(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, active]);

  return count;
}

const StatCard: React.FC<{ stat: Stat; active: boolean }> = ({ stat, active }) => {
  const count = useCountUp(stat.value, 2000, active);

  const displayValue =
    stat.value === 0
      ? '0'
      : stat.value % 1 !== 0
      ? count.toFixed(1)
      : count.toLocaleString();

  return (
    <article className={styles.statCard}>
      <div className={styles.statAccent} style={{ background: stat.color }} />
      <div className={styles.statValue} style={{ color: stat.color }}>
        {stat.prefix ?? ''}{displayValue}{stat.suffix}
      </div>
      <div className={styles.statLabel}>{stat.label}</div>
      <div className={styles.statSub}>{stat.sublabel}</div>
    </article>
  );
};

const Statistics: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id="statistics" aria-labelledby="stats-heading">
      <div className={styles.bgGlow} aria-hidden="true" />
      <div className="container">
        <div className={styles.header}>
          <span className={`badge badge--primary`}>By the Numbers</span>
          <h2 id="stats-heading" className={styles.title}>
            Proven Safety at Scale
          </h2>
          <p className={styles.subtitle}>
            Trusted by mining operations worldwide, our numbers speak to the
            reliability and effectiveness of MINEGUARD's safety platform.
          </p>
        </div>

        <div className={styles.grid}>
          {STATS.map((s) => (
            <StatCard key={s.label} stat={s} active={visible} />
          ))}
        </div>

        {/* Clients row */}
        <div className={styles.clientsRow}>
          <span className={styles.clientsLabel}>Trusted by leading mining companies worldwide</span>
          <div className={styles.clients}>
            {['RioTech Mining', 'AngloGold', 'BHP Safety', 'Glencore', 'Coal India'].map((c) => (
              <div key={c} className={styles.client}>{c}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Statistics;
