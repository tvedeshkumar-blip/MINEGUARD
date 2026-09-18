import React, { useState } from 'react';
import styles from './HistoryPanel.module.css';
import { MOCK_HISTORY_POINTS, MOCK_HISTORY_LOGS } from '../../data/mockData';

const HistoryPanel: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  // Convert points to SVG polyline coordinates
  // SVG viewBox: 0 0 500 180
  const width = 500;
  const height = 180;
  const padding = 30;

  const coPoints = MOCK_HISTORY_POINTS.map((pt, i) => {
    const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
    const y = height - padding - (pt.co / 80) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const ch4Points = MOCK_HISTORY_POINTS.map((pt, i) => {
    const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
    const y = height - padding - (pt.ch4 / 2.0) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const tempPoints = MOCK_HISTORY_POINTS.map((pt, i) => {
    const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((pt.temperature - 15) / 25) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const humidityPoints = MOCK_HISTORY_POINTS.map((pt, i) => {
    const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((pt.humidity - 30) / 60) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={styles.container}>
      {/* Time Range Selector & Export Controls */}
      <div className={styles.header}>
        <div className={styles.timeFilters}>
          <button 
            className={`${styles.filterBtn} ${timeRange === 'today' ? styles.activeFilter : ''}`}
            onClick={() => setTimeRange('today')}
          >
            Today (Shift A/B)
          </button>
          <button 
            className={`${styles.filterBtn} ${timeRange === '7days' ? styles.activeFilter : ''}`}
            onClick={() => setTimeRange('7days')}
          >
            Last 7 Days
          </button>
          <button 
            className={`${styles.filterBtn} ${timeRange === '30days' ? styles.activeFilter : ''}`}
            onClick={() => setTimeRange('30days')}
          >
            Last 30 Days
          </button>
        </div>

        <button className={styles.exportBtn} onClick={handleExport}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          {exported ? '✓ Exporting CSV & PDF Report...' : 'Export Telemetry Archive'}
        </button>
      </div>

      {/* SVG Time-Series Historical Trend Charts */}
      <div className={styles.chartsGrid}>
        {/* Gas Trends (CO vs CH4) */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Atmospheric Gas Trend (24h)
            </h3>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#ef4444' }}></span>
                <span>CO (ppm)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#f59e0b' }}></span>
                <span>CH₄ (% vol)</span>
              </div>
            </div>
          </div>

          <svg className={styles.chartSvg} viewBox="0 0 500 180">
            {/* Grid lines */}
            <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(255,255,255,0.05)" />
            <line x1="30" y1="90" x2="470" y2="90" stroke="rgba(255,255,255,0.05)" />
            <line x1="30" y1="150" x2="470" y2="150" stroke="rgba(255,255,255,0.1)" />

            {/* Critical Threshold Line for CO (35 ppm) */}
            <line x1="30" y1="95" x2="470" y2="95" stroke="rgba(239, 68, 68, 0.4)" strokeDasharray="4 2" />
            <text x="35" y="90" fill="#ef4444" fontSize="9" fontWeight="700">CO Safe Limit (35 ppm)</text>

            {/* CO Polyline */}
            <polyline 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2.5" 
              points={coPoints} 
            />

            {/* CH4 Polyline */}
            <polyline 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="2" 
              strokeDasharray="5 3"
              points={ch4Points} 
            />

            {/* X-axis labels */}
            {MOCK_HISTORY_POINTS.map((pt, i) => {
              const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
              return (
                <text key={pt.timestamp} x={x} y="170" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                  {pt.timeLabel}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Temperature & Humidity Shifts */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Thermal & Humidity Progression (24h)
            </h3>
            <div className={styles.chartLegend}>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#38bdf8' }}></span>
                <span>Humidity (%RH)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: '#f97316' }}></span>
                <span>Temperature (°C)</span>
              </div>
            </div>
          </div>

          <svg className={styles.chartSvg} viewBox="0 0 500 180">
            {/* Grid lines */}
            <line x1="30" y1="30" x2="470" y2="30" stroke="rgba(255,255,255,0.05)" />
            <line x1="30" y1="90" x2="470" y2="90" stroke="rgba(255,255,255,0.05)" />
            <line x1="30" y1="150" x2="470" y2="150" stroke="rgba(255,255,255,0.1)" />

            {/* Humidity Polyline */}
            <polyline 
              fill="none" 
              stroke="#38bdf8" 
              strokeWidth="2" 
              points={humidityPoints} 
            />

            {/* Temperature Polyline */}
            <polyline 
              fill="none" 
              stroke="#f97316" 
              strokeWidth="2.5" 
              points={tempPoints} 
            />

            {/* X-axis labels */}
            {MOCK_HISTORY_POINTS.map((pt, i) => {
              const x = padding + (i / (MOCK_HISTORY_POINTS.length - 1)) * (width - 2 * padding);
              return (
                <text key={pt.timestamp} x={x} y="170" fill="var(--text-muted)" fontSize="9" textAnchor="middle">
                  {pt.timeLabel}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Historical Audit Event Log Table */}
      <div className={styles.logsCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className={styles.chartTitle}>Historical Event & Telemetry Logs</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chronological Subsurface Audit Trail</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Category</th>
                <th>Mine Sector</th>
                <th>Event Description</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY_LOGS.map(log => {
                const catClass = 
                  log.category === 'rover' ? styles.catRover :
                  log.category === 'gas' ? styles.catGas :
                  log.category === 'worker' ? styles.catWorker :
                  log.category === 'emergency' ? styles.catEmergency : styles.catSystem;

                return (
                  <tr key={log.id}>
                    <td><code style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.timestamp}</code></td>
                    <td><span className={`${styles.categoryTag} ${catClass}`}>{log.category}</span></td>
                    <td><strong>{log.zone}</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{log.description}</td>
                    <td>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 700,
                        color: log.severity === 'CRITICAL' ? '#ef4444' : log.severity === 'MODERATE' ? '#f59e0b' : '#22c55e'
                      }}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
