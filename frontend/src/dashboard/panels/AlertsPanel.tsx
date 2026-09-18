import React, { useState } from 'react';
import styles from './AlertsPanel.module.css';
import type { RiskLevel, DashboardPanel } from '../../types';
import { useLiveData } from '../../contexts/LiveDataContext';

interface Props {
  onNavigate?: (panel: DashboardPanel) => void;
}

const AlertsPanel: React.FC<Props> = ({ onNavigate }) => {
  const { alerts, acknowledgeAlert } = useLiveData();
  const [filter, setFilter] = useState<RiskLevel | 'ALL' | 'RESOLVED'>('ALL');

  const handleAcknowledge = (id: string) => {
    acknowledgeAlert(id);
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'RESOLVED') return a.resolved;
    if (filter === 'ALL') return !a.resolved;
    return a.riskLevel === filter && !a.resolved;
  });

  const criticalCount = alerts.filter(a => a.riskLevel === 'CRITICAL' && !a.resolved).length;
  const moderateCount = alerts.filter(a => a.riskLevel === 'MODERATE' && !a.resolved).length;
  const normalCount = alerts.filter(a => a.riskLevel === 'NORMAL' && !a.resolved).length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${filter === 'ALL' ? styles.activeTab : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Active Alerts
          </button>
          <button 
            className={`${styles.tab} ${filter === 'CRITICAL' ? styles.activeTab : ''}`}
            onClick={() => setFilter('CRITICAL')}
          >
            🔴 Critical
            <span className={styles.badgeCritical}>{criticalCount}</span>
          </button>
          <button 
            className={`${styles.tab} ${filter === 'MODERATE' ? styles.activeTab : ''}`}
            onClick={() => setFilter('MODERATE')}
          >
            🟡 Moderate
            <span className={styles.badgeModerate}>{moderateCount}</span>
          </button>
          <button 
            className={`${styles.tab} ${filter === 'NORMAL' ? styles.activeTab : ''}`}
            onClick={() => setFilter('NORMAL')}
          >
            🟢 Normal / Info
            <span>({normalCount})</span>
          </button>
          <button 
            className={`${styles.tab} ${filter === 'RESOLVED' ? styles.activeTab : ''}`}
            onClick={() => setFilter('RESOLVED')}
          >
            Resolved History
            <span className={styles.badgeResolved}>{resolvedCount}</span>
          </button>
        </div>
      </div>

      <div className={styles.alertList}>
        {filteredAlerts.map(alert => {
          const timeString = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const isAcked = alert.resolved;
          const cardClass = alert.resolved 
            ? styles.cardResolved 
            : alert.riskLevel === 'CRITICAL' 
            ? styles.cardCritical 
            : alert.riskLevel === 'MODERATE' 
            ? styles.cardModerate 
            : styles.cardNormal;

          const tagClass = alert.riskLevel === 'CRITICAL' ? styles.tagCritical : alert.riskLevel === 'MODERATE' ? styles.tagModerate : styles.tagNormal;

          return (
            <div key={alert.id} className={`${styles.alertCard} ${cardClass}`}>
              <div className={styles.alertIconWrapper}>
                {alert.riskLevel === 'CRITICAL' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                ) : alert.riskLevel === 'MODERATE' ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>

              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <h3 className={styles.alertTitle}>
                    <span className={`${styles.severityTag} ${tagClass}`}>{alert.riskLevel}</span>
                    {alert.message}
                  </h3>
                  <span className={styles.alertTime}>{timeString}</span>
                </div>

                {alert.currentValue && (
                  <div className={styles.telemetryComparison}>
                    <span><strong>Measured Value:</strong> {alert.currentValue}</span>
                    <span><strong>Safety Threshold:</strong> {alert.threshold || 'N/A'}</span>
                    <span><strong>Sensor Type:</strong> {alert.sensor || alert.type}</span>
                  </div>
                )}

                <div className={styles.alertMeta}>
                  <span><strong>Section:</strong> {alert.zone} ({alert.zoneId})</span>
                  <span><strong>Classification:</strong> {alert.type}</span>
                  <span><strong>Status:</strong> {alert.resolved ? 'Resolved' : isAcked ? 'Acknowledged (Investigating)' : 'Active Unacknowledged'}</span>
                </div>
              </div>

              {!alert.resolved && (
                <div className={styles.alertActions}>
                  {alert.riskLevel === 'CRITICAL' && (
                    <button 
                      className={styles.actionBtnPrimary}
                      onClick={() => onNavigate && onNavigate('emergency')}
                    >
                      Emergency Action →
                    </button>
                  )}

                  <button 
                    className={styles.actionBtnSecondary}
                    onClick={() => onNavigate && onNavigate('rover-control')}
                  >
                    Deploy Rover
                  </button>

                  <button 
                    className={styles.actionBtnSecondary}
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={isAcked}
                  >
                    {isAcked ? '✓ Acknowledged' : 'Acknowledge'}
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className={styles.emptyState}>No alerts matching the selected category.</div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
