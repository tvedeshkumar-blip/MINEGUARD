import React from 'react';
import styles from './OverviewPanel.module.css';
import type { DashboardPanel } from '../../types';
import { useLiveData } from '../../contexts/LiveDataContext';

interface Props {
  onNavigate?: (panel: DashboardPanel) => void;
}

const STATUS_COLORS: Record<string, string> = {
  safe: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  offline: '#64748b',
};

const OverviewPanel: React.FC<Props> = ({ onNavigate }) => {
  const { workers, zones, alerts, rover } = useLiveData();
  const activeWorkers = workers.length;
  const emergencyWorkers = workers.filter(w => w.status === 'EMERGENCY').length;
  const safeZones = zones.filter(z => z.status === 'safe').length;
  const criticalAlerts = alerts.filter(a => a.riskLevel === 'CRITICAL' && !a.resolved).length;
  const activeAlerts = alerts.filter(a => !a.resolved).length;

  // Max peak sensor across all zones for quick atmosphere gauge
  const highestCO = Math.max(...zones.map(z => z.sensors.co));
  const highestCH4 = Math.max(...zones.map(z => z.sensors.ch4));
  const lowestO2 = Math.min(...zones.filter(z => z.sensors.o2 > 0).map(z => z.sensors.o2));
  const highestTemp = Math.max(...zones.map(z => z.sensors.temperature));

  return (
    <div className={styles.container}>
      {/* Demo Notice Banner */}
      <div className={styles.demoBanner}>
        <span><strong>[DEMO DATA & SIMULATION MODE]</strong> Real-time underground telemetry simulation active. Hardware communication endpoints ready for Phase 5.</span>
        <span>SIH PS ID: 26039</span>
      </div>

      {/* Primary KPI Status Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Underground Personnel</div>
          <div className={styles.kpiValue}>{activeWorkers}</div>
          <div className={styles.kpiSub}>
            <span className={styles.textGreen}>{activeWorkers - emergencyWorkers} Safe</span> •{' '}
            <span className={styles.textRed}>{emergencyWorkers} In Hazard Zone</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Zone Health Index</div>
          <div className={`${styles.kpiValue} ${safeZones < zones.length ? styles.textYellow : styles.textGreen}`}>
            {safeZones}/{zones.length}
          </div>
          <div className={styles.kpiSub}>1 Danger (B4) • 1 Warning (C3) • 1 Offline</div>
        </div>

        <div className={`${styles.kpiCard} ${criticalAlerts > 0 ? styles.kpiCritical : ''}`}>
          <div className={styles.kpiLabel}>Active Alerts</div>
          <div className={`${styles.kpiValue} ${criticalAlerts > 0 ? styles.textRed : styles.textYellow}`}>
            {activeAlerts}
          </div>
          <div className={styles.kpiSub}>
            <strong className={styles.textRed}>{criticalAlerts} Critical</strong> gas inrush at B4
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Recon Platform</div>
          <div className={`${styles.kpiValue} ${styles.textGreen}`}>1/1 Online</div>
          <div className={styles.kpiSub}>Rover Ground Unit</div>
        </div>
      </div>

      {/* Mid Section: Rover & Multi-Gas Highlights */}
      <div className={styles.midGrid}>
        {/* Rover Status Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="6" width="20" height="10" rx="2"></rect>
                <circle cx="6" cy="18" r="2.5"></circle>
                <circle cx="12" cy="18" r="2.5"></circle>
                <circle cx="18" cy="18" r="2.5"></circle>
              </svg>
              Rover Status
            </h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate && onNavigate('rover-control')}>
              Controls →
            </button>
          </div>
          <div className={styles.telemetryGrid}>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Operating State</div>
              <div className={`${styles.telVal} ${styles.textGreen}`}>{rover.status}</div>
            </div>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Battery</div>
              <div className={styles.telVal}>{rover.batteryPct}% ({rover.batteryVoltage}V)</div>
            </div>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Current Zone</div>
              <div className={styles.telVal}>Level 2 (B4)</div>
            </div>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Front Scoop</div>
              <div className={`${styles.telVal} ${styles.textYellow}`}>{rover.scoopState}</div>
            </div>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Speed & Incline</div>
              <div className={styles.telVal}>{rover.currentSpeedKmH} km/h • +{rover.pitchDeg}°</div>
            </div>
            <div className={styles.telemetryItem}>
              <div className={styles.telLabel}>Front Obstacle</div>
              <div className={styles.telVal}>{rover.obstacleDistanceM}m (Scanning)</div>
            </div>
          </div>
        </div>

        {/* Mine Atmosphere Peak Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Atmospheric Peak Telemetry
            </h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate && onNavigate('sensors')}>
              Sensors →
            </button>
          </div>
          <div className={styles.gasList}>
            {/* Carbon Monoxide */}
            <div className={styles.gasRow}>
              <div className={styles.gasHeader}>
                <span className={styles.gasName}>Carbon Monoxide (CO)</span>
                <span className={`${styles.gasValue} ${highestCO > 35 ? styles.textRed : styles.textGreen}`}>
                  {highestCO} ppm (Max Limit: 35)
                </span>
              </div>
              <div className={styles.gasBarBg}>
                <div 
                  className={styles.gasBarFill} 
                  style={{ width: `${Math.min(100, (highestCO / 70) * 100)}%`, background: highestCO > 35 ? '#ef4444' : '#22c55e' }}
                />
              </div>
            </div>

            {/* Methane CH4 */}
            <div className={styles.gasRow}>
              <div className={styles.gasHeader}>
                <span className={styles.gasName}>Methane (CH₄)</span>
                <span className={`${styles.gasValue} ${highestCH4 > 1.0 ? styles.textRed : styles.textGreen}`}>
                  {highestCH4}% vol (Max Limit: 1.0% vol)
                </span>
              </div>
              <div className={styles.gasBarBg}>
                <div 
                  className={styles.gasBarFill} 
                  style={{ width: `${Math.min(100, (highestCH4 / 2.0) * 100)}%`, background: highestCH4 > 1.0 ? '#ef4444' : '#22c55e' }}
                />
              </div>
            </div>

            {/* Oxygen O2 */}
            <div className={styles.gasRow}>
              <div className={styles.gasHeader}>
                <span className={styles.gasName}>Oxygen (O₂)</span>
                <span className={`${styles.gasValue} ${lowestO2 < 19.5 ? styles.textRed : styles.textGreen}`}>
                  {lowestO2}% (Min Safe: 19.5%)
                </span>
              </div>
              <div className={styles.gasBarBg}>
                <div 
                  className={styles.gasBarFill} 
                  style={{ width: `${(lowestO2 / 21) * 100}%`, background: lowestO2 < 19.5 ? '#ef4444' : '#22c55e' }}
                />
              </div>
            </div>

            {/* Temperature */}
            <div className={styles.gasRow}>
              <div className={styles.gasHeader}>
                <span className={styles.gasName}>Peak Ambient Temp</span>
                <span className={`${styles.gasValue} ${highestTemp > 30 ? styles.textYellow : styles.textGreen}`}>
                  {highestTemp}°C
                </span>
              </div>
              <div className={styles.gasBarBg}>
                <div 
                  className={styles.gasBarFill} 
                  style={{ width: `${(highestTemp / 45) * 100}%`, background: highestTemp > 30 ? '#f59e0b' : '#22c55e' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Camera Preview Section */}
      <div className={styles.cameraGrid}>
        <div className={styles.cameraCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Rover Forward Camera Feed [SIMULATED]
            </h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate && onNavigate('rover-camera')}>
              Full Screen HUD →
            </button>
          </div>
          <div className={styles.videoMiniFeed}>
            <div className={styles.hudOverlay}>
              <div className={styles.hudTop}>
                <span className={styles.hudTag}>ROVER-01</span>
                <span className={styles.hudTag}>IR NIGHT VISION: ON</span>
              </div>
              <div className={styles.hudCrosshair}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="8"></circle>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              <div className={styles.hudBottom}>
                <span>ZONE B4 (HEADING 082°)</span>
                <span>DEBRIS CLEARANCE: 1.35m</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Zone Map Preview & Event Log */}
      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Underground Mine Layout Preview</h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate && onNavigate('zones')}>
              Interactive Zone Map →
            </button>
          </div>
          <div className={styles.mapContainer}>
            <svg className={styles.tunnels} viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="15" y1="18" x2="80" y2="18" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="15" y1="50" x2="80" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="15" y1="82" x2="80" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="15" y1="18" x2="15" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="48" y1="18" x2="48" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
              <line x1="80" y1="18" x2="80" y2="82" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            </svg>
            
            {zones.map(z => (
              <div 
                key={z.id}
                className={styles.zoneNode}
                style={{ left: `${z.x}%`, top: `${z.y}%`, '--zone-color': STATUS_COLORS[z.status] } as React.CSSProperties}
              >
                <div className={`${styles.zoneRing} ${z.status === 'danger' ? styles.pulseRing : ''}`}></div>
                <div className={styles.zoneId}>{z.id}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Event Activity Stream */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Activity Stream</h3>
            <button className={styles.viewAllBtn} onClick={() => onNavigate && onNavigate('alerts')}>
              All Alerts →
            </button>
          </div>
          <div className={styles.eventList}>
            {alerts.map(alert => {
              const timeString = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isDanger = alert.severity === 'danger';
              const isWarning = alert.severity === 'warning';
              const itemClass = isDanger ? styles.eventDanger : isWarning ? styles.eventWarning : styles.eventNormal;

              return (
                <div key={alert.id} className={`${styles.eventItem} ${itemClass}`}>
                  <div className={styles.eventIcon}>
                    {isDanger ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                      </svg>
                    )}
                  </div>
                  <div className={styles.eventContent}>
                    <div className={styles.eventMsg}>{alert.message}</div>
                    <div className={styles.eventTime}>{timeString} • {alert.zone}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPanel;
