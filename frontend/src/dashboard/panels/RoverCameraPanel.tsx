import React, { useState, useEffect } from 'react';
import styles from './RoverCameraPanel.module.css';
import { useLiveData } from '../../contexts/LiveDataContext';
import type { VisionMode, CameraSourceType } from '../../types';

const STREAM_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/vision/stream`;

const RoverCameraPanel: React.FC = () => {
  const { rover, visionMetadata, visionConfig, updateVisionConfig, testVisionConnection } = useLiveData();

  const [visionMode, setVisionMode] = useState<VisionMode>('thermal_ai');
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(85);
  const [panAngle, setPanAngle] = useState(0);
  const [tiltAngle, setTiltAngle] = useState(-5);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [streamError, setStreamError] = useState(false);

  // Configuration Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [cfgSource, setCfgSource] = useState<CameraSourceType>(visionConfig?.camera_source || 'simulator');
  const [cfgUrl, setCfgUrl] = useState(visionConfig?.esp32_cam_url || 'http://192.168.1.100');
  const [cfgEndpoint, setCfgEndpoint] = useState(visionConfig?.esp32_stream_endpoint || '/stream');
  const [cfgConfidence, setCfgConfidence] = useState(visionConfig?.yolo_confidence || 0.40);
  const [cfgColormap, setCfgColormap] = useState(visionConfig?.thermal_colormap || 'INFERNO');
  const [cfgHotspotThresh, setCfgHotspotThresh] = useState(visionConfig?.thermal_hotspot_threshold || 0.80);
  const [testingConn, setTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ reachable?: boolean; message?: string } | null>(null);

  // Sync state when config loads from backend
  useEffect(() => {
    if (visionConfig) {
      setCfgSource(visionConfig.camera_source);
      setCfgUrl(visionConfig.esp32_cam_url);
      setCfgEndpoint(visionConfig.esp32_stream_endpoint);
      setCfgConfidence(visionConfig.yolo_confidence);
      setCfgColormap(visionConfig.thermal_colormap);
      setCfgHotspotThresh(visionConfig.thermal_hotspot_threshold);
    }
  }, [visionConfig]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSnapshot = () => {
    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await testVisionConnection(cfgUrl, cfgEndpoint);
      setTestResult(res);
    } catch (e) {
      setTestResult({ reachable: false, message: (e as Error).message });
    } finally {
      setTestingConn(false);
    }
  };

  const handleSaveConfig = async () => {
    await updateVisionConfig({
      camera_source: cfgSource,
      esp32_cam_url: cfgUrl,
      esp32_stream_endpoint: cfgEndpoint,
      yolo_confidence: cfgConfidence,
      thermal_colormap: cfgColormap,
      thermal_hotspot_threshold: cfgHotspotThresh
    });
    setIsConfigOpen(false);
  };

  // Derive stream URL
  const streamUrl = `${STREAM_BASE_URL}?mode=${visionMode}&t=${Date.now()}`;

  // Camera Status metrics
  const camStatus = visionMetadata?.camera?.status || 'ONLINE';
  const camSource = (visionMetadata?.camera?.source || visionConfig?.camera_source || 'simulator').toUpperCase();
  const camFps = visionMetadata?.camera?.fps !== undefined ? visionMetadata.camera.fps : 15.0;
  const camRes = visionMetadata?.camera?.resolution || '640x480';
  const aiLatency = visionMetadata?.inference_ms || 32.4;
  const detections = visionMetadata?.detections || [];
  const hotspots = visionMetadata?.hotspots || [];

  const isThermalMode = visionMode === 'thermal' || visionMode === 'thermal_ai';
  const isAiMode = visionMode === 'ai_vision' || visionMode === 'thermal_ai';

  const viewportBgClass = 
    visionMode === 'night' ? styles.nightVisionBg :
    isThermalMode ? styles.thermalBg : styles.standardBg;

  return (
    <div className={styles.container}>
      {/* Informational Banner */}
      <div className={styles.banner}>
        <span>
          <strong>[AI PSEUDO-THERMAL VISION HUD]</strong> Live ESP32-CAM ingestion pipeline with Ultralytics YOLO object detection &amp; relative intensity pseudo-thermal colormap.
        </span>
        <button className={styles.configToggleBtn} onClick={() => setIsConfigOpen(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          Configure Camera / ESP32
        </button>
      </div>

      <div className={styles.mainGrid}>
        {/* Main Video Viewport */}
        <div className={styles.videoSection}>
          <div className={styles.videoHeader}>
            <h3 className={styles.videoTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
              ROVER OPTICAL HUD &amp; AI VISION – {rover.name}
            </h3>
            <div className={styles.livePill}>
              <span className={styles.liveDot} style={{ background: camStatus === 'ONLINE' ? '#22c55e' : '#ef4444' }}></span>
              {camSource}: {camStatus}
            </div>
          </div>

          <div className={`${styles.videoViewport} ${viewportBgClass}`}>
            <div className={styles.scanlines} />

            {/* Live Processed Video Stream */}
            {!streamError ? (
              <img
                key={visionMode}
                src={streamUrl}
                alt="Live AI Vision Stream"
                className={styles.streamImage}
                onError={() => setStreamError(true)}
                onLoad={() => setStreamError(false)}
              />
            ) : (
              <div className={styles.offlineOverlay}>
                <svg className={styles.offlineIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                  <path d="M21 21l-4.35-4.35M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
                <strong>CAMERA STREAM OFFLINE</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Attempting auto-reconnect to {camSource} ({visionConfig?.esp32_cam_url || 'localhost'})...
                </span>
                <button className={styles.toggleBtn} onClick={() => setStreamError(false)} style={{ marginTop: '8px' }}>
                  Retry Feed
                </button>
              </div>
            )}

            {/* Live Detection Overlays from WebSocket Metadata (if not burned in or when showAiOverlay is checked) */}
            {showAiOverlay && isAiMode && detections.length > 0 && (
              <>
                {detections.map((det, idx) => {
                  const b = det.bbox;
                  // Map coordinates based on 640x480 standard viewport
                  const leftPct = (b.x1 / 640) * 100;
                  const topPct = (b.y1 / 480) * 100;
                  const widthPct = ((b.x2 - b.x1) / 640) * 100;
                  const heightPct = ((b.y2 - b.y1) / 480) * 100;
                  return (
                    <div
                      key={idx}
                      className={styles.aiBoundingBox}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        borderColor: isThermalMode ? '#38bdf8' : '#22c55e',
                        background: isThermalMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(34, 197, 94, 0.1)'
                      }}
                    >
                      <span className={styles.aiBoxLabel} style={{ background: isThermalMode ? '#38bdf8' : '#22c55e' }}>
                        {det.hazard_category || det.class_name.toUpperCase()} ({(det.confidence * 100).toFixed(0)}%)
                      </span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Live Hotspot Callout Overlays */}
            {isThermalMode && hotspots.length > 0 && (
              <>
                {hotspots.map((hs, idx) => {
                  const leftPct = (hs.x / 640) * 100;
                  const topPct = (hs.y / 480) * 100;
                  const widthPct = (hs.width / 640) * 100;
                  const heightPct = (hs.height / 480) * 100;
                  return (
                    <div
                      key={`hs-${idx}`}
                      className={styles.hotspotBox}
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`
                      }}
                    >
                      <span className={styles.hotspotBadge}>
                        🔴 HOTSPOT {(hs.intensity * 100).toFixed(0)}% [{hs.severity}]
                      </span>
                    </div>
                  );
                })}
              </>
            )}

            {/* Scientific Colormap Legend (Displayed in Thermal Modes) */}
            {isThermalMode && (
              <div className={styles.thermalLegendContainer}>
                <div className={styles.thermalLegendHeader}>
                  <span>AI PSEUDO-THERMAL</span>
                  <span className={styles.badgeEstimated}>AI ESTIMATED</span>
                </div>
                <div className={styles.thermalGradientBar} />
                <div className={styles.thermalLabels}>
                  <span>LOW (Cold)</span>
                  <span>MED</span>
                  <span>HIGH (Hot)</span>
                </div>
                <div className={styles.thermalDisclaimer}>
                  ⚠️ Relative visual intensity only. Not calibrated physical temperature.
                </div>
              </div>
            )}

            {/* HUD Overlay Elements */}
            <div className={styles.hudOverlay}>
              <div className={styles.hudTop}>
                <div className={styles.hudBadge}>
                  SECTOR: {rover.zoneId} (DEEP DEV LEVEL 2)
                </div>
                <div className={styles.hudBadge}>
                  PAN: {panAngle}° | TILT: {tiltAngle}° | HEADING: 082° E
                </div>
                <div className={styles.hudBadge}>
                  TIME: {currentTime}
                </div>
              </div>

              {/* Center Crosshair HUD */}
              <div className={styles.hudCenter}>
                <svg className={styles.crosshairSvg} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="50" cy="50" r="30" strokeDasharray="3 3" />
                  <line x1="50" y1="10" x2="50" y2="35" />
                  <line x1="50" y1="65" x2="50" y2="90" />
                  <line x1="10" y1="50" x2="35" y2="50" />
                  <line x1="65" y1="50" x2="90" y2="50" />
                  <circle cx="50" cy="50" r="2" fill="currentColor" />
                </svg>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>
                  OBSTACLE DISTANCE: {rover.obstacleDistanceM}m
                </span>
              </div>

              <div className={styles.hudBottom}>
                <div className={styles.hudBadge}>
                  MODE: {visionMode.replace('_', ' ').toUpperCase()} | IR LIGHTS: {lightIntensity}%
                </div>
                <div className={styles.hudBadge}>
                  SCOOP STATUS: {rover.scoopState} | SPEED: {rover.currentSpeedKmH} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Camera Telemetry Status Bar */}
          <div className={styles.cameraStatusBar}>
            <div className={styles.statusGroup}>
              <div className={styles.statusItem}>
                <span>Source:</span>
                <strong>{camSource}</strong>
              </div>
              <div className={styles.statusItem}>
                <span>Status:</span>
                <strong style={{ color: camStatus === 'ONLINE' ? '#22c55e' : '#ef4444' }}>
                  {camStatus}
                </strong>
              </div>
              <div className={styles.statusItem}>
                <span>FPS:</span>
                <strong>{camFps}</strong>
              </div>
              <div className={styles.statusItem}>
                <span>Resolution:</span>
                <strong>{camRes}</strong>
              </div>
            </div>

            <div className={styles.statusGroup}>
              <div className={styles.statusItem}>
                <span>AI Latency:</span>
                <strong>{aiLatency} ms</strong>
              </div>
              <div className={styles.statusItem}>
                <span>Thermal:</span>
                <span className={styles.badgeEstimated}>AI ESTIMATED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Control Sidebar */}
        <div className={styles.controlCard}>
          <div className={styles.controlSection}>
            <div className={styles.sectionTitle}>Vision &amp; Optics Modes</div>
            <div className={styles.toggleGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button 
                className={`${styles.toggleBtn} ${visionMode === 'normal' ? styles.activeToggle : ''}`}
                onClick={() => setVisionMode('normal')}
              >
                Standard RGB
              </button>
              <button 
                className={`${styles.toggleBtn} ${visionMode === 'night' ? styles.activeToggle : ''}`}
                onClick={() => setVisionMode('night')}
              >
                IR Night Vision
              </button>
              <button 
                className={`${styles.toggleBtn} ${visionMode === 'ai_vision' ? styles.activeToggle : ''}`}
                onClick={() => setVisionMode('ai_vision')}
              >
                🎯 AI Vision (HUD)
              </button>
              <button 
                className={`${styles.toggleBtn} ${visionMode === 'thermal' ? styles.activeToggle : ''}`}
                onClick={() => setVisionMode('thermal')}
              >
                🔥 Pseudo-Thermal
              </button>
              <button 
                className={`${styles.toggleBtn} ${visionMode === 'thermal_ai' ? styles.activeToggle : ''}`}
                onClick={() => setVisionMode('thermal_ai')}
                style={{ gridColumn: 'span 2' }}
              >
                ⚡ Thermal + AI (Dual Overlay)
              </button>
            </div>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.sectionTitle}>AI Detection HUD</div>
            <button 
              className={`${styles.toggleBtn} ${showAiOverlay ? styles.activeToggle : ''}`}
              onClick={() => setShowAiOverlay(!showAiOverlay)}
            >
              {showAiOverlay ? '✓ AI Detection Overlay Active' : 'AI Detection Overlay Hidden'}
            </button>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.sectionTitle}>PTZ Pan &amp; Tilt Gimbal</div>
            <div className={styles.ptzGrid}>
              <span></span>
              <button className={styles.ptzBtn} onClick={() => setTiltAngle(t => Math.min(45, t + 5))}>▲ Up</button>
              <span></span>
              <button className={styles.ptzBtn} onClick={() => setPanAngle(p => Math.max(-90, p - 10))}>◀ Left</button>
              <button className={styles.ptzBtn} onClick={() => { setPanAngle(0); setTiltAngle(0); }}>Center</button>
              <button className={styles.ptzBtn} onClick={() => setPanAngle(p => Math.min(90, p + 10))}>Right ▶</button>
              <span></span>
              <button className={styles.ptzBtn} onClick={() => setTiltAngle(t => Math.max(-45, t - 5))}>▼ Down</button>
              <span></span>
            </div>
          </div>

          <div className={styles.controlSection}>
            <div className={styles.sectionTitle}>LED High-Beam Headlights</div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={lightIntensity}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Off (0%)</span>
              <span><strong>{lightIntensity}% Brightness</strong></span>
              <span>100% Flood</span>
            </div>
          </div>

          <button className={styles.snapshotBtn} onClick={handleSnapshot}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            {snapshotTaken ? '✓ Snapshot Saved to Incident Dossier' : 'Capture Recon Snapshot'}
          </button>
        </div>
      </div>

      {/* Configuration Modal */}
      {isConfigOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsConfigOpen(false)}>
          <div className={styles.configModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Camera &amp; AI Vision Configuration
              </h4>
              <button className={styles.closeBtn} onClick={() => setIsConfigOpen(false)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Camera Feed Source</label>
                <select 
                  className={styles.formSelect}
                  value={cfgSource}
                  onChange={(e) => setCfgSource(e.target.value as CameraSourceType)}
                >
                  <option value="esp32">ESP32-CAM Wi-Fi Module</option>
                  <option value="simulator">Synthetic Deep Tunnel Simulator</option>
                  <option value="file">Test Video / Image File</option>
                </select>
              </div>

              {cfgSource === 'esp32' && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>ESP32-CAM Base URL</label>
                    <input 
                      type="text"
                      className={styles.formInput}
                      value={cfgUrl}
                      placeholder="http://192.168.1.100"
                      onChange={(e) => setCfgUrl(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Stream / Capture Endpoint</label>
                    <div className={styles.testRow}>
                      <input 
                        type="text"
                        className={styles.formInput}
                        value={cfgEndpoint}
                        placeholder="/stream"
                        style={{ flex: 1 }}
                        onChange={(e) => setCfgEndpoint(e.target.value)}
                      />
                      <button 
                        className={styles.testBtn}
                        onClick={handleTestConnection}
                        disabled={testingConn}
                      >
                        {testingConn ? 'Testing...' : 'Test Connection'}
                      </button>
                    </div>
                    {testResult && (
                      <div className={testResult.reachable ? styles.testResultSuccess : styles.testResultError}>
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>YOLO Object Detection Confidence</span>
                  <strong>{(cfgConfidence * 100).toFixed(0)}%</strong>
                </label>
                <input 
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={cfgConfidence}
                  onChange={(e) => setCfgConfidence(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Pseudo-Thermal False Colormap</label>
                <select 
                  className={styles.formSelect}
                  value={cfgColormap}
                  onChange={(e) => setCfgColormap(e.target.value)}
                >
                  <option value="INFERNO">Inferno (Recommended Scientific Standard)</option>
                  <option value="TURBO">Turbo (Rainbow High-Contrast)</option>
                  <option value="MAGMA">Magma</option>
                  <option value="PLASMA">Plasma</option>
                  <option value="JET">Jet (Classic FLIR style)</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>Thermal Hotspot Anomaly Sensitivity</span>
                  <strong>{(cfgHotspotThresh * 100).toFixed(0)}%</strong>
                </label>
                <input 
                  type="range"
                  min="0.60"
                  max="0.95"
                  step="0.02"
                  value={cfgHotspotThresh}
                  onChange={(e) => setCfgHotspotThresh(parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--primary)' }}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.btnCancel} onClick={() => setIsConfigOpen(false)}>Cancel</button>
              <button className={styles.btnSave} onClick={handleSaveConfig}>Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoverCameraPanel;
