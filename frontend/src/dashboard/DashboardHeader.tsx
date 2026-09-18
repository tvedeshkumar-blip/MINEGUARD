import React, { useState, useEffect, useRef } from 'react';
import styles from './DashboardHeader.module.css';
import type { DashboardPanel, RiskLevel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useLiveData } from '../contexts/LiveDataContext';

interface Props {
  activePanel: DashboardPanel;
  onOpenMobileSidebar: () => void;
  onNavigateEmergency?: () => void;
}

const PANEL_METADATA: Record<DashboardPanel, { title: string; subtitle: string }> = {
  overview: {
    title: 'Command Overview',
    subtitle: 'Unified Situational Awareness & System Health'
  },
  zones: {
    title: 'Mine Zone Map',
    subtitle: 'Multi-Level Underground Layout & Gas Heatmaps'
  },
  workers: {
    title: 'Worker Directory & Beacon Tracking',
    subtitle: 'Shift Personnel Vitals & Safety Status'
  },
  alerts: {
    title: 'System Alerts & Telemetry Triggers',
    subtitle: 'Threshold Breaches & Incident Escalation'
  },
  sensors: {
    title: 'Sensor Telemetry & Multi-Gas Analysis',
    subtitle: 'Real-Time Gas Concentrations & Atmospheric Trends'
  },
  'rover-control': {
    title: 'Rover Command & Scoop Actuator',
    subtitle: 'Rugged Multi-Terrain Remote Drive & Debris Clearing'
  },
  'rover-camera': {
    title: 'Rover Forward Optical Inspection Feed',
    subtitle: 'Low-Light Tunnel Vision & Obstacle Detection'
  },
  emergency: {
    title: 'Emergency Response & Rescue Dossier',
    subtitle: 'Continuous Alarm Protocol & Rescue Coordination'
  },
  history: {
    title: 'Historical Telemetry & Audit Logs',
    subtitle: 'Multi-Gas Trends, Mission Archives & Safety Reports'
  },
  'system-status': {
    title: 'Subsystem Diagnostics & Mesh Telemetry',
    subtitle: 'MCU Drivers, RF Link Quality & Sensor Health'
  }
};

const DashboardHeader: React.FC<Props> = ({ activePanel, onOpenMobileSidebar, onNavigateEmergency }) => {
  const { user } = useAuth();
  const { emergency, isBackendConnected } = useLiveData();
  const currentRisk: RiskLevel = emergency?.status === 'ACTIVE' ? 'CRITICAL' : 'NORMAL';
  const [isBuzzerMuted, setIsBuzzerMuted] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);

  // Audio buzzer generator using Web Audio API
  useEffect(() => {
    if (!isBuzzerMuted && currentRisk === 'CRITICAL') {
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        audioContextRef.current = ctx;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz alert tone
        gain.gain.setValueAtTime(0.05, ctx.currentTime); // Low safe volume
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        oscillatorRef.current = osc;
      } catch (err) {
        console.warn('Audio buzzer initiation failed', err);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {
          // ignore
        }
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
        audioContextRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, [isBuzzerMuted, currentRisk]);

  const meta = PANEL_METADATA[activePanel] || { title: 'Dashboard', subtitle: 'MINEGUARD System' };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onOpenMobileSidebar} aria-label="Open menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        
        <div className={styles.titleGroup}>
          <h1 className={styles.title}>{meta.title}</h1>
          <span className={styles.subTitle}>{meta.subtitle}</span>
        </div>
      </div>
      
      <div className={styles.right}>
        {/* Backend & DB Status Badge */}
        <div 
          className={styles.siteInfo} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            borderColor: isBackendConnected ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)',
            background: isBackendConnected ? 'rgba(34, 197, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)'
          }}
          title={isBackendConnected ? 'Connected to Node.js / SQLite backend service' : 'Operating in resilient simulated offline fallback mode'}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: isBackendConnected ? '#22c55e' : '#f59e0b', display: 'inline-block' }}></span>
          <span style={{ fontSize: '11px', fontWeight: 600, color: isBackendConnected ? '#22c55e' : '#f59e0b' }}>
            {isBackendConnected ? 'BACKEND & DB: ONLINE' : 'SIMULATION MODE'}
          </span>
        </div>

        {/* Risk Level Badge */}
        <div className={`${styles.riskPill} ${currentRisk === 'CRITICAL' ? styles.riskCritical : styles.riskNormal}`}>
          <span className={styles.riskDot}></span>
          <span>{currentRisk} RISK</span>
        </div>

        {/* Hardware Buzzer Toggle */}
        <button 
          className={`${styles.buzzerBtn} ${isBuzzerMuted ? styles.buzzerMuted : ''}`}
          onClick={() => setIsBuzzerMuted(!isBuzzerMuted)}
          title={isBuzzerMuted ? 'Unmute simulated hardware buzzer' : 'Mute hardware buzzer'}
        >
          {isBuzzerMuted ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="1" y1="1" x2="23" y2="23"></line>
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <span>Buzzer: Muted</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              <span>Buzzer: Active</span>
            </>
          )}
        </button>

        {/* Active Site */}
        <div className={styles.siteInfo}>
          <span className={styles.siteLabel}>Complex:</span>
          <span className={styles.siteValue}>{user?.site || 'Alpha Mine Complex'}</span>
        </div>

        {/* Emergency Quick Action */}
        {onNavigateEmergency && (
          <button 
            className={styles.emergencyQuickBtn}
            onClick={onNavigateEmergency}
            title="Inspect active emergency incident"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <span>{emergency?.status === 'ACTIVE' ? 'INCIDENT ACTIVE' : 'EMERGENCY'}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
