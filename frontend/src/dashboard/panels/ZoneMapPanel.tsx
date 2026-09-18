import React, { useState } from 'react';
import styles from './ZoneMapPanel.module.css';
import { useLiveData } from '../../contexts/LiveDataContext';
import { MOCK_ZONES, MOCK_ROVER } from '../../data/mockData';
import type { Zone, DashboardPanel } from '../../types';

interface Props {
  onNavigate?: (panel: DashboardPanel) => void;
}

const STATUS_COLORS: Record<string, string> = {
  safe: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  offline: '#64748b',
};

const ZoneMapPanel: React.FC<Props> = ({ onNavigate }) => {
  const { zones, rover } = useLiveData();
  const activeZones = zones && zones.length > 0 ? zones : MOCK_ZONES;
  const activeRover = rover || MOCK_ROVER;

  const [selectedLevel, setSelectedLevel] = useState<number | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<Zone | null>(activeZones.find(z => z.id === 'B4') || activeZones[0]);

  const visibleZones = selectedLevel === 'all' 
    ? activeZones 
    : activeZones.filter(z => z.level === selectedLevel);

  return (
    <div className={styles.container}>
      <div className={styles.mapSection}>
        <div className={styles.mapHeader}>
          <div className={styles.titleArea}>
            <h2 className={styles.title}>Subsurface Layout: Level 1 – Level 3</h2>
            <div className={styles.levelTabs}>
              <button 
                className={`${styles.levelTab} ${selectedLevel === 'all' ? styles.activeLevel : ''}`}
                onClick={() => setSelectedLevel('all')}
              >
                All Levels
              </button>
              <button 
                className={`${styles.levelTab} ${selectedLevel === 1 ? styles.activeLevel : ''}`}
                onClick={() => setSelectedLevel(1)}
              >
                Level 1 (-80m)
              </button>
              <button 
                className={`${styles.levelTab} ${selectedLevel === 2 ? styles.activeLevel : ''}`}
                onClick={() => setSelectedLevel(2)}
              >
                Level 2 (-160m)
              </button>
              <button 
                className={`${styles.levelTab} ${selectedLevel === 3 ? styles.activeLevel : ''}`}
                onClick={() => setSelectedLevel(3)}
              >
                Level 3 (-240m)
              </button>
            </div>
          </div>

          <div className={styles.legend}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: color }}></span>
                <span>{status.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.mapWrapper}>
          <div className={styles.mapGrid}>
            <svg className={styles.tunnelsSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Main Vertical Production Shafts */}
              <line x1="15" y1="10" x2="15" y2="90" className={styles.tunnelShaft} />
              <line x1="48" y1="10" x2="48" y2="90" className={styles.tunnelShaft} />
              <line x1="80" y1="10" x2="80" y2="90" className={styles.tunnelShaft} />

              {/* Horizontal Haulage Drifts */}
              <line x1="10" y1="18" x2="90" y2="18" className={styles.tunnelLine} />
              <line x1="10" y1="50" x2="90" y2="50" className={styles.tunnelLine} />
              <line x1="10" y1="82" x2="90" y2="82" className={styles.tunnelLine} />

              {/* Hazard Gas Cloud Boundary at B4 Level 2 */}
              <circle cx="48" cy="50" r="14" className={styles.hazardArea} />
            </svg>

            {/* Mine Zone Nodes */}
            {visibleZones.map(zone => (
              <button
                key={zone.id}
                className={`${styles.zoneNode} ${selectedZone?.id === zone.id ? styles.selected : ''}`}
                style={{ left: `${zone.x}%`, top: `${zone.y}%`, '--zone-color': STATUS_COLORS[zone.status] } as React.CSSProperties}
                onClick={() => setSelectedZone(zone)}
                title={`${zone.name} (${zone.id})`}
              >
                <div className={`${styles.zoneRing} ${zone.status === 'danger' ? styles.pulseRing : ''}`}></div>
                <div className={styles.zoneId}>{zone.id}</div>
                {zone.workers > 0 && <div className={styles.zoneBadgeWorkers}>{zone.workers} Miners</div>}
              </button>
            ))}

            {/* Rover Live Marker on Map */}
            <div className={styles.roverMarker} style={{ left: '43%', top: '50%' }}>
              <div className={styles.roverIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="2" y="6" width="20" height="10" rx="2"></rect>
                  <circle cx="6" cy="18" r="2.5"></circle>
                  <circle cx="12" cy="18" r="2.5"></circle>
                  <circle cx="18" cy="18" r="2.5"></circle>
                </svg>
              </div>
              <span className={styles.roverLabel}>{activeRover.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Details Sidebar Inspector */}
      <div className={styles.detailsSection}>
        {selectedZone ? (
          <div className={styles.detailsCard}>
            <div className={styles.detailsHeader}>
              <div>
                <h3 className={styles.detailsTitle}>{selectedZone.name}</h3>
                <div className={styles.detailsSub}>Zone Code: {selectedZone.id} • Elevation: Level {selectedZone.level}</div>
              </div>
              <div 
                className={styles.statusBadge}
                style={{ 
                  background: `${STATUS_COLORS[selectedZone.status]}20`, 
                  color: STATUS_COLORS[selectedZone.status],
                  borderColor: `${STATUS_COLORS[selectedZone.status]}50`
                }}
              >
                {selectedZone.status.toUpperCase()}
              </div>
            </div>

            <div className={styles.detailsBody}>
              <div className={styles.zoneDesc}>{selectedZone.description}</div>

              <div className={styles.sectionHeader}>Atmospheric Telemetry</div>
              <div className={styles.sensorMiniGrid}>
                <div className={styles.sensorItem}>
                  <span>CO:</span>
                  <strong style={{ color: selectedZone.sensors.co > 35 ? '#ef4444' : 'inherit' }}>
                    {selectedZone.sensors.co} ppm
                  </strong>
                </div>
                <div className={styles.sensorItem}>
                  <span>CH₄:</span>
                  <strong style={{ color: selectedZone.sensors.ch4 > 1.0 ? '#ef4444' : 'inherit' }}>
                    {selectedZone.sensors.ch4}% vol
                  </strong>
                </div>
                <div className={styles.sensorItem}>
                  <span>O₂:</span>
                  <strong style={{ color: selectedZone.sensors.o2 < 19.5 && selectedZone.sensors.o2 > 0 ? '#ef4444' : 'inherit' }}>
                    {selectedZone.sensors.o2}% vol
                  </strong>
                </div>
                <div className={styles.sensorItem}>
                  <span>Temp:</span>
                  <strong>{selectedZone.sensors.temperature}°C</strong>
                </div>
                <div className={styles.sensorItem}>
                  <span>Humidity:</span>
                  <strong>{selectedZone.sensors.humidity}% RH</strong>
                </div>
                <div className={styles.sensorItem}>
                  <span>Smoke:</span>
                  <strong>{selectedZone.sensors.smokePpm || 0} ppm</strong>
                </div>
              </div>

              <div className={styles.sectionHeader}>Personnel in Section</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Tracked RFID Beacons:</span>
                <strong style={{ color: selectedZone.workers > 0 && selectedZone.status === 'danger' ? '#ef4444' : 'inherit' }}>
                  {selectedZone.workers} Active Personnel
                </strong>
              </div>

              {/* Action Buttons */}
              <div className={styles.actionButtonGroup}>
                <button 
                  className={styles.actionBtnPrimary}
                  onClick={() => onNavigate && onNavigate('rover-control')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="6" width="20" height="10" rx="2"></rect>
                    <circle cx="6" cy="18" r="2.5"></circle>
                    <circle cx="12" cy="18" r="2.5"></circle>
                    <circle cx="18" cy="18" r="2.5"></circle>
                  </svg>
                  Dispatch Rover to {selectedZone.id}
                </button>

                {selectedZone.status === 'danger' && (
                  <button 
                    className={styles.actionBtnSecondary}
                    style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                    onClick={() => onNavigate && onNavigate('emergency')}
                  >
                    View Emergency Protocol Dossier →
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Click any mine zone marker on the layout map to inspect real-time multi-gas telemetry and dispatch recon assets.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZoneMapPanel;
