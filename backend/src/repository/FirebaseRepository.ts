import type { IDataRepository } from './IDataRepository.js';
import { SQLiteRepository } from './SQLiteRepository.js';
import { firestoreAdmin, isAdminInitialized } from '../firebase/admin.js';

export class FirebaseRepository implements IDataRepository {
  private fallbackRepo: SQLiteRepository;

  constructor() {
    this.fallbackRepo = new SQLiteRepository();
  }

  async checkProviderStatus() {
    if (!isAdminInitialized || !firestoreAdmin) {
      return { provider: 'Cloud Firestore', status: 'OFFLINE' as const, details: 'Firebase Admin SDK unconfigured' };
    }
    try {
      const snap = await firestoreAdmin.collection('zones').limit(1).get();
      return { provider: 'Cloud Firestore', status: 'ONLINE' as const, details: `Connected to Cloud Firestore (${snap.size} zones found)` };
    } catch (e: any) {
      return { provider: 'Cloud Firestore', status: 'OFFLINE' as const, details: e.message };
    }
  }

  async getZones() {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getZones();
    try {
      const snap = await firestoreAdmin.collection('zones').get();
      if (snap.empty) return this.fallbackRepo.getZones();
      return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      return this.fallbackRepo.getZones();
    }
  }

  async getZoneById(id: string) {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getZoneById(id);
    try {
      const doc = await firestoreAdmin.collection('zones').doc(id).get();
      if (!doc.exists) return this.fallbackRepo.getZoneById(id);
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      return this.fallbackRepo.getZoneById(id);
    }
  }

  async getWorkers(filter?: { shift?: string; status?: string; search?: string }) {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getWorkers(filter);
    try {
      let ref: any = firestoreAdmin.collection('workers');
      if (filter?.shift && filter.shift !== 'all') {
        ref = ref.where('shift', '==', filter.shift);
      }
      if (filter?.status && filter.status !== 'all') {
        ref = ref.where('status', '==', filter.status);
      }
      const snap = await ref.get();
      if (snap.empty) return this.fallbackRepo.getWorkers(filter);
      let items = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      if (filter?.search) {
        const queryStr = filter.search.toLowerCase();
        items = items.filter((w: any) =>
          w.name?.toLowerCase().includes(queryStr) ||
          w.employeeId?.toLowerCase().includes(queryStr)
        );
      }
      return items;
    } catch (err) {
      return this.fallbackRepo.getWorkers(filter);
    }
  }

  async getAlerts(resolved?: boolean) {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getAlerts(resolved);
    try {
      let ref: any = firestoreAdmin.collection('alerts');
      if (resolved !== undefined) {
        ref = ref.where('resolved', '==', resolved);
      }
      const snap = await ref.get();
      if (snap.empty) return this.fallbackRepo.getAlerts(resolved);
      return snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      return this.fallbackRepo.getAlerts(resolved);
    }
  }

  async acknowledgeAlert(alertId: string, userUid?: string) {
    // Primary execution via SQLite + Firestore sync for resilience
    return this.fallbackRepo.acknowledgeAlert(alertId, userUid);
  }

  async getActiveEmergency() {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getActiveEmergency();
    try {
      const snap = await firestoreAdmin.collection('emergencyIncidents').where('status', '!=', 'RESOLVED').limit(1).get();
      if (snap.empty) return this.fallbackRepo.getActiveEmergency();
      const doc = snap.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      return this.fallbackRepo.getActiveEmergency();
    }
  }

  async acknowledgeEmergency(userUid?: string) {
    return this.fallbackRepo.acknowledgeEmergency(userUid);
  }

  async toggleSopStep(stepId: string, userUid?: string) {
    return this.fallbackRepo.toggleSopStep(stepId, userUid);
  }

  async getRoverState() {
    if (!isAdminInitialized || !firestoreAdmin) return this.fallbackRepo.getRoverState();
    try {
      const doc = await firestoreAdmin.collection('rovers').doc('ROVER-4WD-01').get();
      if (!doc.exists) return this.fallbackRepo.getRoverState();
      return { id: doc.id, ...doc.data() };
    } catch (err) {
      return this.fallbackRepo.getRoverState();
    }
  }

  async updateRoverState(update: any) {
    return this.fallbackRepo.updateRoverState(update);
  }

  async getHistoryPoints() {
    return this.fallbackRepo.getHistoryPoints();
  }

  async getHistoryLogs() {
    return this.fallbackRepo.getHistoryLogs();
  }
}
