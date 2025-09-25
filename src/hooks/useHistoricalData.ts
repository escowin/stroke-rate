import { useState, useEffect, useCallback } from 'react';
import type { HeartRateData, TrainingSession, Rower } from '../types';
import {
  storeHeartRateData,
  storeHeartRateDataBatch,
  getHeartRateDataForSession,
  getHeartRateDataForDevice,
  getHeartRateDataInRange,
  storeSession,
  getAllSessions,
  getSession,
  getRecentSessions,
  storeRower,
  getAllRowers,
  getRower,
  deleteSession,
  getDatabaseStats,
  clearAllData,
  initDatabase
} from '../services/database';

/**
 * Hook for managing historical heart rate data and sessions
 */
export const useHistoricalData = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);

  // Load sessions when database is initialized
  const loadSessions = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      setIsLoading(true);
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Initialize database
  useEffect(() => {
    const initializeDB = async () => {
      try {
        setIsLoading(true);
        await initDatabase();
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize database');
      } finally {
        setIsLoading(false);
      }
    };

    initializeDB();
  }, []);

  // Load sessions when database is initialized
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Store heart rate data point
  const storeHeartRate = useCallback(async (data: HeartRateData & { sessionId: string }) => {
    if (!isInitialized) return;
    
    try {
      await storeHeartRateData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store heart rate data');
    }
  }, [isInitialized]);

  // Store multiple heart rate data points
  const storeHeartRateBatch = useCallback(async (dataPoints: (HeartRateData & { sessionId: string })[]) => {
    if (!isInitialized) return;
    
    try {
      await storeHeartRateDataBatch(dataPoints);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store heart rate data batch');
    }
  }, [isInitialized]);

  // Get heart rate data for session
  const getSessionHeartRateData = useCallback(async (sessionId: string): Promise<HeartRateData[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getHeartRateDataForSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve session heart rate data');
      return [];
    }
  }, [isInitialized]);

  // Get heart rate data for device in session
  const getDeviceHeartRateData = useCallback(async (sessionId: string, deviceId: string): Promise<HeartRateData[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getHeartRateDataForDevice(sessionId, deviceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve device heart rate data');
      return [];
    }
  }, [isInitialized]);

  // Get heart rate data in time range
  const getHeartRateDataInTimeRange = useCallback(async (
    sessionId: string,
    startTime: Date,
    endTime: Date
  ): Promise<HeartRateData[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getHeartRateDataInRange(sessionId, startTime, endTime);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve heart rate data in range');
      return [];
    }
  }, [isInitialized]);

  // Store session
  const storeTrainingSession = useCallback(async (session: TrainingSession) => {
    if (!isInitialized) return;
    
    try {
      await storeSession(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store training session');
    }
  }, [isInitialized]);

  // Get all sessions
  const getAllTrainingSessions = useCallback(async (): Promise<TrainingSession[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getAllSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve sessions');
      return [];
    }
  }, [isInitialized]);

  // Get session by ID
  const getTrainingSession = useCallback(async (sessionId: string): Promise<TrainingSession | undefined> => {
    if (!isInitialized) return undefined;
    
    try {
      return await getSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve session');
      return undefined;
    }
  }, [isInitialized]);

  // Get recent sessions
  const getRecentTrainingSessions = useCallback(async (limit: number = 10): Promise<TrainingSession[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getRecentSessions(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve recent sessions');
      return [];
    }
  }, [isInitialized]);

  // Store rower
  const storeRowerProfile = useCallback(async (rower: Rower) => {
    if (!isInitialized) return;
    
    try {
      await storeRower(rower);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store rower profile');
    }
  }, [isInitialized]);

  // Get all rowers
  const getAllRowerProfiles = useCallback(async (): Promise<Rower[]> => {
    if (!isInitialized) return [];
    
    try {
      return await getAllRowers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve rower profiles');
      return [];
    }
  }, [isInitialized]);

  // Get rower by ID
  const getRowerProfile = useCallback(async (rowerId: string): Promise<Rower | undefined> => {
    if (!isInitialized) return undefined;
    
    try {
      return await getRower(rowerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve rower profile');
      return undefined;
    }
  }, [isInitialized]);

  // Delete session
  const deleteTrainingSession = useCallback(async (sessionId: string) => {
    if (!isInitialized) return;
    
    try {
      await deleteSession(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
    }
  }, [isInitialized]);

  // Get database statistics
  const getStats = useCallback(async () => {
    if (!isInitialized) return null;
    
    try {
      return await getDatabaseStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve database statistics');
      return null;
    }
  }, [isInitialized]);

  // Clear all data (for development/testing)
  const clearDatabase = useCallback(async () => {
    if (!isInitialized) return;
    
    try {
      await clearAllData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear database');
    }
  }, [isInitialized]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    sessions,
    
    // Heart rate data methods
    storeHeartRate,
    storeHeartRateBatch,
    getSessionHeartRateData,
    getDeviceHeartRateData,
    getHeartRateDataInTimeRange,
    
    // Session methods
    storeTrainingSession,
    getAllTrainingSessions,
    getTrainingSession,
    getRecentTrainingSessions,
    deleteTrainingSession,
    
    // Rower methods
    storeRowerProfile,
    getAllRowerProfiles,
    getRowerProfile,
    
    // Utility methods
    getStats,
    clearDatabase,
  };
};
