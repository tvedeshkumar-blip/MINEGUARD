import React, { useState } from 'react';
import styles from './WorkersPanel.module.css';
import { MOCK_WORKERS } from '../../data/mockData';

const WorkersPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredWorkers = MOCK_WORKERS.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      w.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.zoneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShift = selectedShift === 'all' || w.shift === selectedShift;
    const matchesStatus = selectedStatus === 'all' || w.status === selectedStatus;

    return matchesSearch && matchesShift && matchesStatus;
  });

  const safeCount = MOCK_WORKERS.filter(w => w.status === 'SAFE').length;
  const warningCount = MOCK_WORKERS.filter(w => w.status === 'WARNING').length;
  const emergencyCount = MOCK_WORKERS.filter(w => w.status === 'EMERGENCY').length;

  return (
    <div className={styles.container}>
      {/* Top Stat Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Total Miners Tracked</div>
          <div className={styles.kpiVal}>{MOCK_WORKERS.length}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Safe Atmosphere</div>
          <div className={styles.kpiVal} style={{ color: '#22c55e' }}>{safeCount}</div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiLabel}>Elevated Hazard Section</div>
          <div className={styles.kpiVal} style={{ color: '#f59e0b' }}>{warningCount}</div>
        </div>
        <div className={styles.kpiCard} style={{ borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.06)' }}>
          <div className={styles.kpiLabel}>Emergency Evacuation</div>
          <div className={styles.kpiVal} style={{ color: '#ef4444' }}>{emergencyCount}</div>
        </div>
      </div>

      <div className={styles.mainCard}>
        <div className={styles.header}>
          <div className={styles.searchBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.searchIcon}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search by worker name, EMP ID, zone, or job role..." 
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.filters}>
            <select className={styles.select} value={selectedShift} onChange={(e) => setSelectedShift(e.target.value)}>
              <option value="all">All Shifts</option>
              <option value="A">Shift A (Morning)</option>
              <option value="B">Shift B (Active)</option>
              <option value="C">Shift C (Night)</option>
            </select>
            
            <select className={styles.select} value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="SAFE">SAFE (Green)</option>
              <option value="WARNING">WARNING (Yellow)</option>
              <option value="EMERGENCY">EMERGENCY (Red)</option>
              <option value="UNKNOWN">UNKNOWN (Gray)</option>
            </select>
          </div>
        </div>

        <div className={styles.demoBanner}>
          <strong>[DEMO WORKER DATA]</strong> RFID Beacon tracking simulated. Active shift contains 5 personnel requiring evacuation assistance in Deep Development B4.
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Employee ID</th>
                <th>Designation</th>
                <th>Assigned Zone</th>
                <th>Status</th>
                <th>Vitals / Pulse</th>
                <th>Last Beacon Ping</th>
                <th>Emergency Contact</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkers.map(worker => {
                const lastSeenTime = new Date(worker.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const statusClass = 
                  worker.status === 'SAFE' ? styles.statusSafe :
                  worker.status === 'WARNING' ? styles.statusWarning :
                  worker.status === 'EMERGENCY' ? styles.statusEmergency : styles.statusUnknown;

                return (
                  <tr key={worker.id}>
                    <td>
                      <div className={styles.workerName}>
                        <div className={styles.avatar}>{worker.name.charAt(0)}</div>
                        <span>{worker.name}</span>
                      </div>
                    </td>
                    <td><code className={styles.code}>{worker.employeeId}</code></td>
                    <td>{worker.role}</td>
                    <td>
                      <strong>{worker.zoneName}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px', marginLeft: 4 }}>({worker.zoneId})</span>
                    </td>
                    <td>
                      <span className={`${styles.statusPill} ${statusClass}`}>
                        {worker.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.vitals}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        <span>{worker.heartRate || 75} bpm</span>
                      </div>
                    </td>
                    <td>{lastSeenTime}</td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{worker.emergencyContact || '+91-XXXXX-XXXXX'}</td>
                  </tr>
                );
              })}
              
              {filteredWorkers.length === 0 && (
                <tr>
                  <td colSpan={8} className={styles.emptyRow}>No personnel records found matching your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkersPanel;
