import type { IDataRepository } from './IDataRepository.js';
import { SQLiteRepository } from './SQLiteRepository.js';
import { FirebaseRepository } from './FirebaseRepository.js';

const provider = (process.env.DATA_PROVIDER || 'sqlite').toLowerCase();

let repository: IDataRepository;

if (provider === 'firebase') {
  repository = new FirebaseRepository();
  console.log('[DATA REPOSITORY] Primary provider set to Cloud Firestore.');
} else {
  repository = new SQLiteRepository();
  console.log('[DATA REPOSITORY] Primary provider set to SQLite local database.');
}

export { repository, SQLiteRepository, FirebaseRepository };
export type { IDataRepository };
