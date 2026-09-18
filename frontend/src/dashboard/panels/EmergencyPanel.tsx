import React from 'react';
import styles from './EmergencyPanel.module.css';
import type { DashboardPanel } from '../../types';
import { useLiveData } from '../../contexts/LiveDataContext';
import { MOCK_EMERGENCY } from '../../data/mockData';

interface Props {
  onNavigate?: (panel: DashboardPanel) => void;
}

const EmergencyPanel: React.FC<Props> = ({ onNavigate }) => {
  const { emergency, toggleSopStep, rover } = useLiveData();
  const incident = emergency || MOCK_EMERGENCY;
  const sopList = incident.sopSteps;

  const toggleSop = (id: string) => {
    toggleSopStep(id);
  };

  const handleAcknowledge = () => {
    if (emergency) {
      emergency.acknowledged = true;
    }
  };

  return (
    <div className={styles.container}>
      {/* Active Incident Hero Banner */}
      <div className={styles.alertHero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroIcon}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div>
            <h2 className={styles.heroTitle}>{incident.title}</h2>
            <div className={styles.heroSub}>
              Incident Code: <strong>{incident.id}</strong> • Location: <strong>{incident.zone} ({incident.zoneId})</strong> • Level {incident.level}
            </div>
          </div>
        </div>

        <div className={styles.heroRight}>
          <button 
            className={styles.ackBtn}
            onClick={handleAcknowledge}
            disabled={incident.acknowledged}
          >
            {incident.acknowledged ? '✓ Incident Acknowledged' : '⚠ Acknowledge Emergency'}
          </button>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Left Column: Atmospheric Telemetry & Recon Mission Status */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              </svg>
              Critical Hazard Telemetry Peaks
            </h3>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 800 }}>SEVERITY: CRITICAL</span>
          </div>

          <div className={styles.gasGrid}>
            <div className={styles.gasCard} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className={styles.gasLabel}>Carbon Monoxide</div>
              <div className={styles.gasVal} style={{ color: '#ef4444' }}>{incident.coPeak} ppm</div>
              <div className={styles.gasLimit}>Threshold: 35 ppm</div>
            </div>

            <div className={styles.gasCard} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className={styles.gasLabel}>Methane (CH₄)</div>
              <div className={styles.gasVal} style={{ color: '#ef4444' }}>{incident.ch4Peak}% LEL</div>
              <div className={styles.gasLimit}>Threshold: 1.0%</div>
            </div>

            <div className={styles.gasCard} style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
              <div className={styles.gasLabel}>Oxygen Level</div>
              <div className={styles.gasVal} style={{ color: '#ef4444' }}>{incident.o2Level}% vol</div>
              <div className={styles.gasLimit}>Min Safe: 19.5%</div>
            </div>
          </div>

          {/* Affected Personnel Warning */}
          <div className={styles.workerWarningCard}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>5 Miners In Heading Section</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>EMP-101 (Rajesh Sharma) leading refuge protocol</div>
            </div>
            <button 
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
              onClick={() => onNavigate && onNavigate('workers')}
            >
              View Miner Vitals →
            </button>
          </div>

          {/* Rover Recon Status */}
          <div className={styles.reconStatusBlock}>
            <div className={styles.reconHeader}>
              <span>🤖 Rover Investigation</span>
              <span style={{ color: '#22c55e' }}>{rover.status}</span>
            </div>
            <div className={styles.reconText}>{incident.roverStatus}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button 
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: 4, fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => onNavigate && onNavigate('rover-control')}
              >
                Rover Controls & Scoop →
              </button>
              <button 
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: 4, fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => onNavigate && onNavigate('rover-camera')}
              >
                Forward Camera Feed →
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Standard Operating Procedure (SOP) & Rescue Decision */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
              Standard Emergency Response Flow
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              {sopList.filter(s => s.completed).length}/{sopList.length} Steps Completed
            </span>
          </div>

          <div className={styles.timelineList}>
            {sopList.map((step, idx) => (
              <div key={step.id} className={styles.timelineItem} onClick={() => toggleSop(step.id)} style={{ cursor: 'pointer' }}>
                <div className={`${styles.timelineMarker} ${!step.completed ? styles.markerPending : ''}`}>
                  {step.completed ? '✓' : idx + 1}
                </div>
                <div className={styles.timelineBody}>
                  <div className={styles.timelineStepTitle} style={{ color: step.completed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {step.title}
                  </div>
                  {step.timestamp && <div className={styles.timelineTime}>Timestamp: {step.timestamp}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Rescue Team Briefing Dossier */}
          <div className={styles.briefingDossier}>
            <div className={styles.dossierTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              Rescue Captain Dossier Summary
            </div>
            <div className={styles.dossierText}>
              "Assess the danger before sending people into the danger." Rover confirms 140kg rockfall partially pushed from heading. Atmospheric verification in progress. Human rescue entry recommended only with SCBA breathing gear via Crosscut 4B.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyPanel;
