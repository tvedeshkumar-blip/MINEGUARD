import React from 'react';
import styles from './DashboardSidebar.module.css';
import type { DashboardPanel } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_ALERTS, MOCK_ROVER } from '../data/mockData';

interface Props {
  activePanel: DashboardPanel;
  onChangePanel: (panel: DashboardPanel) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemDef {
  id: DashboardPanel;
  label: string;
  section?: 'operations' | 'rover' | 'system';
  badge?: React.ReactNode;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItemDef[] = [
  // ── Mine Operations ──
  {
    id: 'overview',
    label: 'Overview',
    section: 'operations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
    )
  },
  {
    id: 'zones',
    label: 'Zone Map',
    section: 'operations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
        <line x1="9" y1="3" x2="9" y2="21"></line>
        <line x1="15" y1="3" x2="15" y2="21"></line>
      </svg>
    )
  },
  {
    id: 'workers',
    label: 'Workers',
    section: 'operations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    )
  },
  {
    id: 'alerts',
    label: 'Alerts',
    section: 'operations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    )
  },
  {
    id: 'sensors',
    label: 'Sensors',
    section: 'operations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
      </svg>
    )
  },

  // ── Rover ──
  {
    id: 'rover-control',
    label: 'Rover Control',
    section: 'rover',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="10" rx="2"></rect>
        <circle cx="6" cy="18" r="2.5"></circle>
        <circle cx="12" cy="18" r="2.5"></circle>
        <circle cx="18" cy="18" r="2.5"></circle>
        <path d="M5 6V3h4"></path>
        <path d="M19 6V4h-3"></path>
      </svg>
    )
  },
  {
    id: 'rover-camera',
    label: 'Rover Camera',
    section: 'rover',
    badge: <span className={styles.badgeLive}>LIVE</span>,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z"></path>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
      </svg>
    )
  },

  // ── Safety & System ──
  {
    id: 'emergency',
    label: 'Emergency',
    section: 'system',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    )
  },
  {
    id: 'history',
    label: 'History & Logs',
    section: 'system',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    )
  },
  {
    id: 'system-status',
    label: 'System Status',
    section: 'system',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    )
  }
];

const DashboardSidebar: React.FC<Props> = ({ activePanel, onChangePanel, isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const unresolvedAlertsCount = MOCK_ALERTS.filter(a => !a.resolved).length;

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && <div className={styles.overlay} onClick={onCloseMobile} />}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logoContainer}>
          <a href="#/" className={styles.logo}>
            <span className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L3 8.5V19.5L14 26L25 19.5V8.5L14 2Z" fill="url(#logoGradSidebar)" />
                <path d="M14 7L8 10.5V17.5L14 21L20 17.5V10.5L14 7Z" fill="rgba(0,0,0,0.4)" />
                <path d="M14 11.5L11 13.25V16.75L14 18.5L17 16.75V13.25L14 11.5Z" fill="#fff" fillOpacity="0.9" />
                <defs>
                  <linearGradient id="logoGradSidebar" x1="3" y1="2" x2="25" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f97316" />
                    <stop offset="1" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
            <span className={styles.logoText}>MINE<span className={styles.logoAccent}>GUARD</span></span>
          </a>
          <span className={styles.demoTag}>[PROTOTYPE / DEMO]</span>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSectionLabel}>Mine Operations</div>
          {NAV_ITEMS.filter(item => item.section === 'operations').map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePanel === item.id ? styles.active : ''}`}
              onClick={() => {
                onChangePanel(item.id);
                onCloseMobile();
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.id === 'alerts' && unresolvedAlertsCount > 0 && (
                <span className={styles.badgeAlert}>{unresolvedAlertsCount}</span>
              )}
            </button>
          ))}

          <div className={styles.navSectionLabel}>Rover</div>
          {NAV_ITEMS.filter(item => item.section === 'rover').map(item => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePanel === item.id ? styles.active : ''}`}
              onClick={() => {
                onChangePanel(item.id);
                onCloseMobile();
              }}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge}
            </button>
          ))}

          <div className={styles.navSectionLabel}>Safety & System</div>
          {NAV_ITEMS.filter(item => item.section === 'system').map(item => {
            const isEmergency = item.id === 'emergency';
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${activePanel === item.id ? (isEmergency ? styles.emergencyActive : styles.active) : (isEmergency ? styles.emergencyAlert : '')}`}
                onClick={() => {
                  onChangePanel(item.id);
                  onCloseMobile();
                }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
                {isEmergency && <span className={styles.badgeAlert}>CRITICAL</span>}
              </button>
            );
          })}
        </nav>

        {/* Hardware Status Widget */}
        <div className={styles.hardwareQuickStatus}>
          <div className={styles.hwRow}>
            <span>Rover</span>
            <span className={styles.hwIndicator}>
              <span className={styles.hwDot} />
              {MOCK_ROVER.batteryPct}%
            </span>
          </div>
        </div>

        <div className={styles.userSection}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{user.avatarInitials}</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{user.name}</div>
                <div className={styles.userRole}>{user.role.replace('_', ' ')}</div>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={logout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;
