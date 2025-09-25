import { openDB, deleteDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { HeartRateData, TrainingSession, Rower } from '../types';

// Database schema definition
interface StrokeRateDB extends DBSchema {
  heartRateData: {
    key: string; // Composite key: `${sessionId}-${deviceId}-${timestamp}`
    value: HeartRateData & { sessionId: string };
    indexes: {
      'by-session': string; // sessionId
      'by-device': string; // deviceId
      'by-timestamp': number; // timestamp.getTime()
      'by-session-device': [string, string]; // [sessionId, deviceId]
    };
  };
  sessions: {
    key: string; // sessionId
    value: TrainingSession;
    indexes: {
      'by-startTime': number; // startTime.getTime()
      'by-endTime': number; // endTime?.getTime() or 0
    };
  };
  rowers: {
    key: string; // rowerId
    value: Rower;
  };
}

// Database configuration
const DB_NAME = 'StrokeRateDB';
const DB_VERSION = 2;

// Database instance
let db: IDBPDatabase<StrokeRateDB> | null = null;

/**
 * Initialize the IndexedDB database
 */
export const initDatabase = async (): Promise<IDBPDatabase<StrokeRateDB>> => {
  if (db) {
    return db;
  }

  db = await openDB<StrokeRateDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Only create stores if they don't exist (oldVersion === 0 means new database)
      if (oldVersion < 1) {
        // Heart rate data store
        const heartRateStore = db.createObjectStore('heartRateData', {
          keyPath: 'key',
        });
        
        // Indexes for efficient querying
        heartRateStore.createIndex('by-session', 'sessionId');
        heartRateStore.createIndex('by-device', 'deviceId');
        heartRateStore.createIndex('by-timestamp', 'timestamp', { unique: false });
        heartRateStore.createIndex('by-session-device', ['sessionId', 'deviceId']);

        // Sessions store
        const sessionsStore = db.createObjectStore('sessions', {
          keyPath: 'id',
        });
        
        sessionsStore.createIndex('by-startTime', 'startTime', { unique: false });
        sessionsStore.createIndex('by-endTime', 'endTime', { unique: false });

        // Rowers store
        db.createObjectStore('rowers', {
          keyPath: 'id',
        });
      }
      
      // Handle version 2 upgrade (fix for keyPath issue)
      if (oldVersion < 2) {
        // The keyPath fix is handled by the new storage functions
        // No schema changes needed, just data structure changes
      }
    },
  });

  return db;
};

/**
 * Get database instance
 */
export const getDatabase = async (): Promise<IDBPDatabase<StrokeRateDB>> => {
  if (!db) {
    return await initDatabase();
  }
  return db;
};

/**
 * Store heart rate data point
 */
export const storeHeartRateData = async (data: HeartRateData & { sessionId: string }): Promise<void> => {
  const database = await getDatabase();
  const key = `${data.sessionId}-${data.deviceId}-${data.timestamp.getTime()}`;
  
  const dataToStore = {
    key: key,
    deviceId: data.deviceId,
    heartRate: data.heartRate,
    timestamp: data.timestamp,
    zone: data.zone,
    sessionId: data.sessionId,
  };
  
  await database.put('heartRateData', dataToStore);
};

/**
 * Store multiple heart rate data points efficiently
 */
export const storeHeartRateDataBatch = async (dataPoints: (HeartRateData & { sessionId: string })[]): Promise<void> => {
  const database = await getDatabase();
  const tx = database.transaction('heartRateData', 'readwrite');
  
  for (const data of dataPoints) {
    const key = `${data.sessionId}-${data.deviceId}-${data.timestamp.getTime()}`;
    const dataToStore = {
      key: key,
      deviceId: data.deviceId,
      heartRate: data.heartRate,
      timestamp: data.timestamp,
      zone: data.zone,
      sessionId: data.sessionId,
    };
    
    await tx.store.put(dataToStore);
  }
  
  await tx.done;
};

/**
 * Retrieve heart rate data for a specific session
 */
export const getHeartRateDataForSession = async (sessionId: string): Promise<HeartRateData[]> => {
  const database = await getDatabase();
  const data = await database.getAllFromIndex('heartRateData', 'by-session', sessionId);
  return data.map(item => ({
    deviceId: item.deviceId,
    heartRate: item.heartRate,
    timestamp: item.timestamp,
    zone: item.zone,
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/**
 * Retrieve heart rate data for a specific device in a session
 */
export const getHeartRateDataForDevice = async (sessionId: string, deviceId: string): Promise<HeartRateData[]> => {
  const database = await getDatabase();
  const data = await database.getAllFromIndex('heartRateData', 'by-session-device', [sessionId, deviceId]);
  return data.map(item => ({
    deviceId: item.deviceId,
    heartRate: item.heartRate,
    timestamp: item.timestamp,
    zone: item.zone,
  })).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/**
 * Retrieve heart rate data within a time range
 */
export const getHeartRateDataInRange = async (
  sessionId: string,
  startTime: Date,
  endTime: Date
): Promise<HeartRateData[]> => {
  const database = await getDatabase();
  const sessionData = await database.getAllFromIndex('heartRateData', 'by-session', sessionId);
  
  return sessionData
    .map(item => ({
      deviceId: item.deviceId,
      heartRate: item.heartRate,
      timestamp: item.timestamp,
      zone: item.zone,
    }))
    .filter(data => data.timestamp >= startTime && data.timestamp <= endTime)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

/**
 * Store training session
 */
export const storeSession = async (session: TrainingSession): Promise<void> => {
  const database = await getDatabase();
  await database.put('sessions', session);
};

/**
 * Retrieve all sessions
 */
export const getAllSessions = async (): Promise<TrainingSession[]> => {
  const database = await getDatabase();
  const sessions = await database.getAll('sessions');
  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

/**
 * Retrieve session by ID
 */
export const getSession = async (sessionId: string): Promise<TrainingSession | undefined> => {
  const database = await getDatabase();
  return await database.get('sessions', sessionId);
};

/**
 * Retrieve recent sessions (last N sessions)
 */
export const getRecentSessions = async (limit: number = 10): Promise<TrainingSession[]> => {
  const database = await getDatabase();
  const sessions = await database.getAllFromIndex('sessions', 'by-startTime');
  return sessions
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit);
};

/**
 * Get the current active session (if any)
 * Automatically ends stale sessions (older than 4 hours)
 */
export const getCurrentActiveSession = async (): Promise<TrainingSession | null> => {
  const database = await getDatabase();
  const sessions = await database.getAll('sessions');
  
  // Find the most recent active session
  const activeSession = sessions
    .filter(session => session.isActive)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
  
  if (!activeSession) {
    return null;
  }
  
  // Check if session is stale (older than 4 hours)
  const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
  if (activeSession.startTime < fourHoursAgo) {
    // Auto-end the stale session
    const endedSession = {
      ...activeSession,
      endTime: new Date(),
      isActive: false,
      finalHeartRateData: [...activeSession.heartRateData]
    };
    
    // Update the session in the database
    await database.put('sessions', endedSession);
    
    return null; // No active session to restore
  }
  
  return activeSession;
};

/**
 * Get the most recent session (active or ended) for display purposes
 */
export const getMostRecentSession = async (): Promise<TrainingSession | null> => {
  const database = await getDatabase();
  const sessions = await database.getAll('sessions');
  
  if (sessions.length === 0) {
    return null;
  }
  
  // Find the most recent session (active or ended)
  const mostRecentSession = sessions
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];
  
  return mostRecentSession;
};

/**
 * Store rower profile
 */
export const storeRower = async (rower: Rower): Promise<void> => {
  const database = await getDatabase();
  await database.put('rowers', rower);
};

/**
 * Retrieve all rowers
 */
export const getAllRowers = async (): Promise<Rower[]> => {
  const database = await getDatabase();
  return await database.getAll('rowers');
};

/**
 * Retrieve rower by ID
 */
export const getRower = async (rowerId: string): Promise<Rower | undefined> => {
  const database = await getDatabase();
  return await database.get('rowers', rowerId);
};

/**
 * Delete session and all associated heart rate data
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  const database = await getDatabase();
  const tx = database.transaction(['sessions', 'heartRateData'], 'readwrite');
  
  // Delete session
  await tx.objectStore('sessions').delete(sessionId);
  
  // Delete all heart rate data for this session
  const heartRateData = await tx.objectStore('heartRateData').index('by-session').getAll(sessionId);
  for (const data of heartRateData) {
    const key = `${sessionId}-${data.deviceId}-${data.timestamp.getTime()}`;
    await tx.objectStore('heartRateData').delete(key);
  }
  
  await tx.done;
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async (): Promise<{
  totalSessions: number;
  totalHeartRateDataPoints: number;
  totalRowers: number;
  databaseSize: number;
}> => {
  const database = await getDatabase();
  
  const [sessions, heartRateData, rowers] = await Promise.all([
    database.count('sessions'),
    database.count('heartRateData'),
    database.count('rowers'),
  ]);
  
  // Estimate database size (rough approximation)
  const databaseSize = (sessions * 1000) + (heartRateData * 50) + (rowers * 500);
  
  return {
    totalSessions: sessions,
    totalHeartRateDataPoints: heartRateData,
    totalRowers: rowers,
    databaseSize,
  };
};

// Realistic database cap for heart rate monitoring data
// Based on: 90min practices, 5x/week, ~270KB per session
// 100MB = ~4 months of data (370 sessions)
export const DATABASE_CAP_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Get actual database usage from browser storage API with realistic cap
 */
export const getDatabaseUsage = async (): Promise<{ usage: number; quota: number; percentage: number; cap: number } | null> => {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined) {
        // Use our realistic cap instead of browser's massive quota
        const usage = estimate.usage;
        const quota = Math.min(estimate.quota || DATABASE_CAP_BYTES, DATABASE_CAP_BYTES);
        const percentage = usage / quota;
        
        return {
          usage,
          quota,
          percentage,
          cap: DATABASE_CAP_BYTES
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get database usage:', error);
    return null;
  }
};

/**
 * Clear specific object store
 */
export const clearObjectStore = async (storeName: 'sessions' | 'heartRateData' | 'rowers'): Promise<void> => {
  const database = await getDatabase();
  const tx = database.transaction([storeName], 'readwrite');
  await tx.objectStore(storeName).clear();
  await tx.done;
};

/**
 * Clear all data (for development/testing)
 */
export const clearAllData = async (): Promise<void> => {
  const database = await getDatabase();
  const tx = database.transaction(['sessions', 'heartRateData', 'rowers'], 'readwrite');
  
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('heartRateData').clear(),
    tx.objectStore('rowers').clear(),
  ]);
  
  await tx.done;
};

/**
 * Delete the entire database (useful for development/testing)
 */
export const deleteDatabase = async (): Promise<void> => {
  if (db) {
    db.close();
    db = null;
  }
  
  await deleteDB(DB_NAME);
};
