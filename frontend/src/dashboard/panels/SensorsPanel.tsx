import React, { useState } from 'react';
import styles from './SensorsPanel.module.css';
import { useLiveData } from '../../contexts/LiveDataContext';
import { MOCK_ZONES } from '../../data/mockData';

const SensorsPanel: React.FC = () => {
  const { zones } = useLiveData();
  const activeZones = zones && zones.length > 0 ? zones : MOCK_ZONES;

  const [levelFilter, setLevelFilter] = useState<'all' | 1 | 2 | 3>('all');

  const filteredZones = levelFilter === 'all' 
    ? activeZones 
    : activeZones.filter(z => z.level === levelFilter);

  // Highest values across mine
  const peakCO = Math.max(...activeZones.map(z => z.sensors.co));
  const peakCH4 = Math.max(...activeZones.map(z => z.sensors.ch4));
  const lowestO2 = Math.min(...activeZones.filter(z => z.sensors.o2 > 0).map(z => z.sensors.o2));
  const peakTemp = Math.max(...activeZones.map(z => z.sensors.temperature));
  const avgHumidity = Math.round(
    activeZones.filter(z => z.status !== 'offline').reduce((acc, z) => acc + z.sensors.humidity, 0) / 
    (activeZones.filter(z => z.status !== 'offline').length || 1)
  );

  return (
    <div className={styles.container}>
      {/* Aggregate Mine-Wide Metric Cards */}
      <div className={styles.aggregateGrid}>
        <div className={styles.aggCard} style={{ borderColor: peakCO > 35 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div className={styles.aggLabel}>Carbon Monoxide (CO)</div>
          <div className={styles.aggValue} style={{ color: peakCO > 35 ? '#ef4444' : '#22c55e' }}>
            {peakCO} <span className={styles.aggUnit}>ppm</span>
            <span className={styles.trendUp} style={{ fontSize: '13px', marginLeft: 6 }}>↑ Spike</span>
          </div>
          <div className={styles.aggThreshold}>Threshold: &lt; 35 ppm • Peak at B4</div>
        </div>

        <div className={styles.aggCard} style={{ borderColor: peakCH4 > 1.0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div className={styles.aggLabel}>Methane (CH₄)</div>
          <div className={styles.aggValue} style={{ color: peakCH4 > 1.0 ? '#ef4444' : '#22c55e' }}>
            {peakCH4}% <span className={styles.aggUnit}>vol</span>
            <span className={styles.trendUp} style={{ fontSize: '13px', marginLeft: 6 }}>↑ Rising</span>
          </div>
          <div className={styles.aggThreshold}>Threshold: &lt; 1.0% vol • Peak at B4</div>
        </div>

        <div className={styles.aggCard} style={{ borderColor: lowestO2 < 19.5 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)' }}>
          <div className={styles.aggLabel}>Minimum Oxygen (O₂)</div>
          <div className={styles.aggValue} style={{ color: lowestO2 < 19.5 ? '#ef4444' : '#22c55e' }}>
            {lowestO2}% <span className={styles.aggUnit}>vol</span>
            <span className={styles.trendDown} style={{ fontSize: '13px', marginLeft: 6 }}>↓ Low</span>
          </div>
          <div className={styles.aggThreshold}>Threshold: &gt; 19.5% • Critical Depletion</div>
        </div>

        <div className={styles.aggCard}>
          <div className={styles.aggLabel}>Peak Temperature</div>
          <div className={styles.aggValue} style={{ color: peakTemp > 30 ? '#f59e0b' : '#22c55e' }}>
            {peakTemp}° <span className={styles.aggUnit}>C</span>
            <span className={styles.trendStable} style={{ fontSize: '13px', marginLeft: 6 }}>→ Active</span>
          </div>
          <div className={styles.aggThreshold}>Threshold: &lt; 32°C • Max at B4</div>
        </div>

        <div className={styles.aggCard}>
          <div className={styles.aggLabel}>Average Humidity</div>
          <div className={styles.aggValue}>
            {avgHumidity}% <span className={styles.aggUnit}>RH</span>
            <span className={styles.trendStable} style={{ fontSize: '13px', marginLeft: 6 }}>→ Normal</span>
          </div>
          <div className={styles.aggThreshold}>Mine Ambient Range: 40–80%</div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className={styles.desc}>Real-time sensor arrays per mine sector.</span>
          <select 
            value={levelFilter} 
            onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as 1 | 2 | 3)}
            style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', padding: '5px 10px', borderRadius: 4, fontSize: '12px' }}
          >
            <option value="all">All Mine Levels</option>
            <option value="1">Level 1 (-80m)</option>
            <option value="2">Level 2 (-160m)</option>
            <option value="3">Level 3 (-240m)</option>
          </select>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#22c55e' }}></span> Normal</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#f59e0b' }}></span> Warning</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#ef4444' }}></span> Critical</span>
          <span className={styles.legendItem}><span className={styles.dot} style={{ background: '#64748b' }}></span> Offline</span>
        </div>
      </div>

      {/* Zone Grid */}
      <div className={styles.grid}>
        {filteredZones.map(zone => {
          const s = zone.sensors;
          const isDanger = zone.status === 'danger';
          const isWarning = zone.status === 'warning';
          const cardClass = isDanger ? styles.cardDanger : isWarning ? styles.cardWarning : zone.status === 'offline' ? styles.cardOffline : styles.cardSafe;

          if (zone.status === 'offline') {
            return (
              <div key={zone.id} className={`${styles.card} ${cardClass}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.zoneName}>{zone.name}</div>
                  <div className={styles.zoneId}>{zone.id} • L{zone.level}</div>
                </div>
                <div className={styles.offlineMsg}>Telemetry node offline. Rover reconnaissance recommended.</div>
              </div>
            );
          }

          return (
            <div key={zone.id} className={`${styles.card} ${cardClass}`}>
              <div className={styles.cardHeader}>
                <div className={styles.zoneName}>{zone.name}</div>
                <div className={styles.zoneId}>{zone.id} • Level {zone.level}</div>
              </div>
              
              <div className={styles.sensorGrid}>
                {/* CO */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Carbon Monoxide</span>
                    <span style={{ fontSize: '9px' }}>CO</span>
                  </div>
                  <div className={styles.sValue} style={{ color: s.co > 35 ? '#ef4444' : s.co > 15 ? '#f59e0b' : 'inherit' }}>
                    {s.co} <span className={styles.sUnit}>ppm</span>
                  </div>
                </div>

                {/* O2 */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Oxygen (O₂)</span>
                    <span style={{ fontSize: '9px' }}>O₂</span>
                  </div>
                  <div className={styles.sValue} style={{ color: s.o2 < 19.5 && s.o2 > 0 ? '#ef4444' : 'inherit' }}>
                    {s.o2} <span className={styles.sUnit}>% vol</span>
                  </div>
                </div>

                {/* CH4 */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Methane (CH₄)</span>
                    <span style={{ fontSize: '9px' }}>CH₄</span>
                  </div>
                  <div className={styles.sValue} style={{ color: s.ch4 > 1.0 ? '#ef4444' : s.ch4 > 0.5 ? '#f59e0b' : 'inherit' }}>
                    {s.ch4} <span className={styles.sUnit}>% vol</span>
                  </div>
                </div>

                {/* Temp */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Ambient Temp</span>
                    <span style={{ fontSize: '9px' }}>TEMP</span>
                  </div>
                  <div className={styles.sValue} style={{ color: s.temperature > 30 ? '#ef4444' : s.temperature > 26 ? '#f59e0b' : 'inherit' }}>
                    {s.temperature} <span className={styles.sUnit}>°C</span>
                  </div>
                </div>

                {/* Humidity */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Humidity</span>
                    <span style={{ fontSize: '9px' }}>RH%</span>
                  </div>
                  <div className={styles.sValue}>
                    {s.humidity} <span className={styles.sUnit}>%</span>
                  </div>
                </div>

                {/* Smoke */}
                <div className={styles.sensor}>
                  <div className={styles.sLabel}>
                    <span>Particulates / Smoke</span>
                    <span style={{ fontSize: '9px' }}>Optical</span>
                  </div>
                  <div className={styles.sValue} style={{ color: (s.smokePpm || 0) > 15 ? '#f59e0b' : 'inherit' }}>
                    {s.smokePpm || 0} <span className={styles.sUnit}>ppm</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorsPanel;
