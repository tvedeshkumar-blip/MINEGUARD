import React from 'react';
import styles from './SystemStatusPanel.module.css';

const SystemStatusPanel: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <span>
          <strong>[SYSTEM ARCHITECTURE & DIAGNOSTICS]</strong> Phase 4B Active: Express REST + WebSocket Backend with SQLite & Cloud Firestore Synchronization.
        </span>
        <span>SIH PS ID: 26039</span>
      </div>

      {/* Subsystem Health Diagnostics Cards */}
      <div className={styles.grid}>
        {/* Rover MCU */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Rover Subsystem
            </h3>
            <span className={`${styles.statusPill} ${styles.statusSimulated}`}>SIMULATED (PHASE 3)</span>
          </div>
          <div className={styles.detailRow}><span>Hardware Role:</span> <strong>Rugged 4WD Ground Platform</strong></div>
          <div className={styles.detailRow}><span>Scoop / Loader:</span> <strong>Compact Front Obstacle Clearing</strong></div>
          <div className={styles.detailRow}><span>Target Controller:</span> <strong>Microcontroller & Motor Drivers (Phase 6)</strong></div>
          <div className={styles.detailRow}><span>Status:</span> <strong>Telemetry Simulation Active</strong></div>
        </div>

        {/* Front Scoop Actuator */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Compact Front Scoop
            </h3>
            <span className={`${styles.statusPill} ${styles.statusSimulated}`}>PROTOTYPE MODE</span>
          </div>
          <div className={styles.detailRow}><span>Mechanism:</span> <strong>Front-Mounted Compact Pusher</strong></div>
          <div className={styles.detailRow}><span>Purpose:</span> <strong>Clear Loose Debris & Gravel</strong></div>
          <div className={styles.detailRow}><span>Design Rule:</span> <strong>Compact Rover Scoop (Not JCB)</strong></div>
          <div className={styles.detailRow}><span>Control:</span> <strong>Manual / Simulated Commands</strong></div>
        </div>

        {/* Multi-Gas Environmental Sensors */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Gas & Environment Array
            </h3>
            <span className={`${styles.statusPill} ${styles.statusSimulated}`}>SIMULATED TELEMETRY</span>
          </div>
          <div className={styles.detailRow}><span>Monitored Gases:</span> <strong>CO (ppm), CH₄ (% vol), O₂ (% vol)</strong></div>
          <div className={styles.detailRow}><span>Environmental:</span> <strong>Temperature (°C), Humidity (% RH)</strong></div>
          <div className={styles.detailRow}><span>Integration Target:</span> <strong>Hardware Sensors (Phase 5)</strong></div>
          <div className={styles.detailRow}><span>Threshold Logic:</span> <strong>Active Rule-Based Evaluation</strong></div>
        </div>

        {/* Subsurface Mesh RF Relay */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Communication Layer
            </h3>
            <span className={`${styles.statusPill} ${styles.statusStandby}`}>TARGET ARCHITECTURE</span>
          </div>
          <div className={styles.detailRow}><span>Planned Protocol:</span> <strong>Subsurface Wireless & Mesh</strong></div>
          <div className={styles.detailRow}><span>Data Format:</span> <strong>JSON Telemetry Payloads</strong></div>
          <div className={styles.detailRow}><span>Frontend Mock:</span> <strong>Pluggable Store (Decoupled)</strong></div>
          <div className={styles.detailRow}><span>Integration Target:</span> <strong>WebSocket / REST API (Phase 4/5)</strong></div>
        </div>

        {/* Cloud Persistence Layer */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              Cloud Persistence
            </h3>
            <span className={`${styles.statusPill} ${styles.statusOnline}`}>ACTIVE (PHASE 4B)</span>
          </div>
          <div className={styles.detailRow}><span>Authentication:</span> <strong>Firebase Auth + Custom Claims</strong></div>
          <div className={styles.detailRow}><span>Database Engine:</span> <strong>Cloud Firestore + SQLite Fallback</strong></div>
          <div className={styles.detailRow}><span>Sync Scope:</span> <strong>Alerts, Emergency, Rover, Users</strong></div>
          <div className={styles.detailRow}><span>Security Rules:</span> <strong>Role-Based Deny-By-Default</strong></div>
        </div>

        {/* Surface Control Station */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />
              Surface Station Dashboard
            </h3>
            <span className={`${styles.statusPill} ${styles.statusOnline}`}>FUNCTIONAL (PHASE 4B)</span>
          </div>
          <div className={styles.detailRow}><span>Frontend Stack:</span> <strong>React + TypeScript + Vite</strong></div>
          <div className={styles.detailRow}><span>Risk Engine:</span> <strong>Rule-Based Threshold Classification</strong></div>
          <div className={styles.detailRow}><span>Design Language:</span> <strong>Industrial Dark Command Interface</strong></div>
          <div className={styles.detailRow}><span>Backend Target:</span> <strong>Node Express REST + WebSocket + Firebase</strong></div>
        </div>
      </div>

      {/* System Architectural Pipeline */}
      <div className={styles.archCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.cardTitle}>MINEGUARD End-to-End System Pipeline</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SIH Product Architecture Flow</span>
        </div>

        <div className={styles.flowDiagram}>
          <div className={styles.flowNode}>
            <div className={styles.nodeTitle}>1. Underground Incident</div>
            <div className={styles.nodeSub}>Gas Spike / Blockage</div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowNode}>
            <div className={styles.nodeTitle}>2. Rover Recon</div>
            <div className={styles.nodeSub}>Sensors + Camera + Scoop</div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowNode}>
            <div className={styles.nodeTitle}>3. RF Mesh Relay</div>
            <div className={styles.nodeSub}>Sub-surface Link</div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowNode}>
            <div className={styles.nodeTitle}>4. Risk Engine</div>
            <div className={styles.nodeSub}>NORMAL / MOD / CRITICAL</div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowNode} style={{ borderColor: 'var(--primary)', background: 'rgba(249, 115, 22, 0.1)' }}>
            <div className={styles.nodeTitle} style={{ color: 'var(--primary)' }}>5. Rescue Decision</div>
            <div className={styles.nodeSub}>Briefing Dossier</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusPanel;
