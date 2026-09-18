import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './DashboardPage.module.css';
import DashboardSidebar from '../dashboard/DashboardSidebar';
import DashboardHeader from '../dashboard/DashboardHeader';
import type { DashboardPanel } from '../types';

// Operational Panels
import OverviewPanel from '../dashboard/panels/OverviewPanel';
import ZoneMapPanel from '../dashboard/panels/ZoneMapPanel';
import WorkersPanel from '../dashboard/panels/WorkersPanel';
import AlertsPanel from '../dashboard/panels/AlertsPanel';
import SensorsPanel from '../dashboard/panels/SensorsPanel';
import RoverControlPanel from '../dashboard/panels/RoverControlPanel';
import RoverCameraPanel from '../dashboard/panels/RoverCameraPanel';
import EmergencyPanel from '../dashboard/panels/EmergencyPanel';
import HistoryPanel from '../dashboard/panels/HistoryPanel';
import SystemStatusPanel from '../dashboard/panels/SystemStatusPanel';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activePanel, setActivePanel] = useState<DashboardPanel>('overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.hash = '/login';
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (activePanel) {
      case 'overview':
        return <OverviewPanel onNavigate={setActivePanel} />;
      case 'zones':
        return <ZoneMapPanel onNavigate={setActivePanel} />;
      case 'workers':
        return <WorkersPanel />;
      case 'alerts':
        return <AlertsPanel onNavigate={setActivePanel} />;
      case 'sensors':
        return <SensorsPanel />;
      case 'rover-control':
        return <RoverControlPanel />;
      case 'rover-camera':
        return <RoverCameraPanel />;
      case 'emergency':
        return <EmergencyPanel onNavigate={setActivePanel} />;
      case 'history':
        return <HistoryPanel />;
      case 'system-status':
        return <SystemStatusPanel />;
      default:
        return <OverviewPanel onNavigate={setActivePanel} />;
    }
  };

  return (
    <div className={styles.layout}>
      <DashboardSidebar 
        activePanel={activePanel} 
        onChangePanel={setActivePanel} 
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className={styles.mainContent}>
        <DashboardHeader 
          activePanel={activePanel} 
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateEmergency={() => setActivePanel('emergency')}
        />
        <main className={styles.panelContainer}>
          {renderPanel()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
