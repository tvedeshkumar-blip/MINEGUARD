import React, { useState } from 'react';
import styles from './RoverControlPanel.module.css';
import type { RoverDirection, ScoopState } from '../../types';
import { useLiveData } from '../../contexts/LiveDataContext';

const RoverControlPanel: React.FC = () => {
  const { rover, dispatchRoverControl, dispatchScoopControl } = useLiveData();
  const [isEmergencyStopped, setIsEmergencyStopped] = useState(false);

  const direction = rover.direction;
  const throttle = rover.targetThrottlePct;
  const scoopState = rover.scoopState;
  const isCrawlerMode = rover.isCrawlerMode;
  const obstacleDistance = rover.obstacleDistanceM;

  const handleDirection = (dir: RoverDirection) => {
    if (isEmergencyStopped) return;
    dispatchRoverControl({ direction: dir, isEmergencyStop: false });
  };

  const handleThrottleChange = (val: number) => {
    dispatchRoverControl({ throttle: val, isEmergencyStop: isEmergencyStopped });
  };

  const handleCrawlerToggle = (val: boolean) => {
    dispatchRoverControl({ isCrawlerMode: val, isEmergencyStop: isEmergencyStopped });
  };

  const handleScoopAction = (state: ScoopState) => {
    dispatchScoopControl(state);
  };

  const handleEmergencyStop = () => {
    setIsEmergencyStopped(true);
    dispatchRoverControl({ direction: 'STOP', throttle: 0, isEmergencyStop: true });
    dispatchScoopControl('STOP');
  };

  const handleResetEStop = () => {
    setIsEmergencyStopped(false);
    dispatchRoverControl({ throttle: 30, isEmergencyStop: false });
  };

  const currentSpeed = isEmergencyStopped ? 0 : rover.currentSpeedKmH;

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <span>
          <strong>[SIMULATED MANUAL PROTOTYPE CONTROLS]</strong> Rugged 4-Wheel Multi-Terrain Platform • Compact Front Scoop Actuator • No physical LEDs on rover hardware.
        </span>
        <span>Vehicle ID: {rover.id}</span>
      </div>

      <div className={styles.mainGrid}>
        {/* Drive and Scoop Control Column */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span className={styles.liveDot}></span>
              Rover Directional Navigation
            </h3>
            <span style={{ fontSize: '12px', color: isEmergencyStopped ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
              {isEmergencyStopped ? 'E-STOP TRIGGERED' : 'ONLINE (STANDBY)'}
            </span>
          </div>

          {/* D-Pad Controls */}
          <div className={styles.controlArea}>
            <button 
              className={`${styles.dPadBtn} ${direction === 'FORWARD' && !isEmergencyStopped ? styles.activeDirection : ''}`}
              onClick={() => handleDirection('FORWARD')}
              disabled={isEmergencyStopped}
              title="Forward (W / Up Arrow)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              FORWARD
            </button>

            <div className={styles.dPadRow}>
              <button 
                className={`${styles.dPadBtn} ${direction === 'LEFT' && !isEmergencyStopped ? styles.activeDirection : ''}`}
                onClick={() => handleDirection('LEFT')}
                disabled={isEmergencyStopped}
                title="Pivot Left (A / Left Arrow)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                LEFT
              </button>

              <button 
                className={`${styles.dPadBtn} ${styles.stopBtn} ${direction === 'STOP' ? styles.activeDirection : ''}`}
                onClick={() => handleDirection('STOP')}
                title="Halt Motors (Spacebar)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
                STOP
              </button>

              <button 
                className={`${styles.dPadBtn} ${direction === 'RIGHT' && !isEmergencyStopped ? styles.activeDirection : ''}`}
                onClick={() => handleDirection('RIGHT')}
                disabled={isEmergencyStopped}
                title="Pivot Right (D / Right Arrow)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
                RIGHT
              </button>
            </div>

            <button 
              className={`${styles.dPadBtn} ${direction === 'REVERSE' && !isEmergencyStopped ? styles.activeDirection : ''}`}
              onClick={() => handleDirection('REVERSE')}
              disabled={isEmergencyStopped}
              title="Reverse (S / Down Arrow)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              REVERSE
            </button>
          </div>

          {/* Speed / Throttle Regulation */}
          <div className={styles.sliderBox}>
            <div className={styles.sliderHeader}>
              <span>Target Throttle: <strong>{throttle}%</strong></span>
              <span>Calculated Speed: <strong>{currentSpeed} km/h</strong></span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={throttle}
              onChange={(e) => handleThrottleChange(Number(e.target.value))}
              disabled={isEmergencyStopped}
              className={styles.rangeInput}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>0% (Idle)</span>
              <span>Low-Speed Crawler Mode</span>
              <span>100% (Full Torque)</span>
            </div>
          </div>

          {/* Compact Front Scoop Actuator Controls */}
          <div className={styles.scoopBox}>
            <div className={styles.scoopHeader}>
              <span className={styles.scoopTitle}>Compact Front Scoop / Loader</span>
              <span className={styles.scoopBadge}>STATE: {scoopState}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Prototype mechanism for pushing loose gravel, rockfall debris, and clearing inspection pathways.
            </p>
            <div className={styles.scoopButtons}>
              <button 
                className={`${styles.scoopBtn} ${scoopState === 'UP' ? styles.activeScoop : ''}`}
                onClick={() => handleScoopAction('UP')}
                disabled={isEmergencyStopped}
              >
                ▲ Raise Scoop
              </button>
              <button 
                className={`${styles.scoopBtn} ${scoopState === 'DOWN' || scoopState === 'CLEARING' ? styles.activeScoop : ''}`}
                onClick={() => handleScoopAction('DOWN')}
                disabled={isEmergencyStopped}
              >
                ▼ Lower / Clear Debris
              </button>
              <button 
                className={`${styles.scoopBtn} ${scoopState === 'STOP' ? styles.activeScoop : ''}`}
                onClick={() => handleScoopAction('STOP')}
              >
                ■ Lock Actuator
              </button>
            </div>
          </div>

          {/* Emergency Stop Action */}
          {isEmergencyStopped ? (
            <button 
              className={styles.emergencyStopBtn} 
              style={{ background: '#22c55e' }}
              onClick={handleResetEStop}
            >
              ✓ Reset Emergency Stop & Re-arm Motors
            </button>
          ) : (
            <button 
              className={styles.emergencyStopBtn}
              onClick={handleEmergencyStop}
            >
              ⚠ EMERGENCY STOP (KILL MOTOR POWER)
            </button>
          )}
        </div>

        {/* Telemetry and Diagnostics Column */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Rover Live Telemetry
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>RSSI: {rover.signalDbm} dBm</span>
          </div>

          <div className={styles.telemetryGrid}>
            <div className={styles.telCard}>
              <div className={styles.telLabel}>Main Battery</div>
              <div className={styles.telValue} style={{ color: '#22c55e' }}>{rover.batteryPct}%</div>
              <div className={styles.telSub}>{rover.batteryVoltage}V LiFePO4 Array</div>
            </div>

            <div className={styles.telCard}>
              <div className={styles.telLabel}>Location Sector</div>
              <div className={styles.telValue} style={{ fontSize: '15px' }}>{rover.zoneId}</div>
              <div className={styles.telSub}>Deep Development L2</div>
            </div>

            <div className={styles.telCard}>
              <div className={styles.telLabel}>Pitch & Roll Incline</div>
              <div className={styles.telValue}>+{rover.pitchDeg}° / {rover.rollDeg}°</div>
              <div className={styles.telSub}>Max Safe Grade: ±35°</div>
            </div>

            <div className={styles.telCard}>
              <div className={styles.telLabel}>Front Obstacle LiDAR</div>
              <div className={styles.telValue} style={{ color: obstacleDistance < 1.0 ? '#ef4444' : '#f59e0b' }}>
                {obstacleDistance}m
              </div>
              <div className={styles.telSub}>Debris clearance path active</div>
            </div>
          </div>

          {/* 4 Individual Motor Current Draws */}
          <div style={{ marginTop: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Independent Motor Currents (Amps)
            </div>
            <div className={styles.motorGrid}>
              {['Front Left (M1)', 'Front Right (M2)', 'Rear Left (M3)', 'Rear Right (M4)'].map((motor, idx) => {
                const currentAmps = isEmergencyStopped ? 0 : (rover.motorCurrentsA[idx] ?? 1.8);
                return (
                  <div key={motor} className={styles.motorRow}>
                    <div className={styles.motorLabel}>
                      <span>{motor}</span>
                      <strong>{currentAmps} A</strong>
                    </div>
                    <div className={styles.motorBarBg}>
                      <div className={styles.motorBarFill} style={{ width: `${(currentAmps / 3.5) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low-Speed Crawler Mode Toggle */}
          <div style={{ background: 'var(--bg-surface)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>High-Torque Crawler Gear</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Limits max top speed to 4.5 km/h for gravel and rock crawl</div>
            </div>
            <button 
              style={{ background: isCrawlerMode ? 'var(--primary)' : 'rgba(255,255,255,0.08)', color: isCrawlerMode ? '#000' : 'var(--text-primary)', border: 'none', padding: '6px 12px', borderRadius: 4, fontWeight: 700, cursor: 'pointer', fontSize: '12px' }}
              onClick={() => handleCrawlerToggle(!isCrawlerMode)}
            >
              {isCrawlerMode ? 'ENGAGED' : 'OFF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoverControlPanel;
