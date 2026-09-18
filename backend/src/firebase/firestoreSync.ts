import { firestoreAdmin, isAdminInitialized } from './admin.js';

/**
 * Non-blocking helper to log audit events into Firestore.
 */
export async function logAuditToFirestore(data: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
}): Promise<void> {
  if (!isAdminInitialized || !firestoreAdmin) return;
  try {
    const docRef = firestoreAdmin.collection('auditLogs').doc();
    await docRef.set({
      id: docRef.id,
      ...data,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC] Failed to write audit log:', err.message);
  }
}

/**
 * Non-blocking helper to sync alert changes to Firestore.
 */
export async function syncAlertToFirestore(alert: any): Promise<void> {
  if (!isAdminInitialized || !firestoreAdmin) return;
  try {
    const docRef = firestoreAdmin.collection('alerts').doc(alert.id);
    await docRef.set({
      ...alert,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC] Failed to sync alert:', err.message);
  }
}

/**
 * Non-blocking helper to sync emergency incident state to Firestore.
 */
export async function syncEmergencyToFirestore(emergency: any): Promise<void> {
  if (!isAdminInitialized || !firestoreAdmin) return;
  try {
    const docRef = firestoreAdmin.collection('emergencyIncidents').doc(emergency.id || 'current_emergency');
    await docRef.set({
      ...emergency,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC] Failed to sync emergency incident:', err.message);
  }
}

/**
 * Non-blocking helper to record rover commands in Firestore.
 */
export async function logRoverCommandToFirestore(cmd: any, userId?: string): Promise<void> {
  if (!isAdminInitialized || !firestoreAdmin) return;
  try {
    const docRef = firestoreAdmin.collection('roverCommands').doc();
    await docRef.set({
      id: docRef.id,
      roverId: 'ROVER-4WD-01',
      command: cmd,
      issuedBy: userId || 'CONTROL_OPERATOR',
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC] Failed to log rover command:', err.message);
  }
}

/**
 * Non-blocking helper to record aggregated rover telemetry.
 */
export async function syncRoverTelemetryToFirestore(telemetry: any): Promise<void> {
  if (!isAdminInitialized || !firestoreAdmin) return;
  try {
    const docRef = firestoreAdmin.collection('rovers').doc('ROVER-4WD-01');
    await docRef.set({
      ...telemetry,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err: any) {
    console.warn('[FIRESTORE SYNC] Failed to sync telemetry:', err.message);
  }
}
