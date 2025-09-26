import { useEffect, lazy, Suspense, useMemo } from 'react';
import { useAppStore } from './store';
import { useBluetooth } from './hooks/useBluetooth';
import { DeviceSetup } from './components/DeviceSetup';
import { ConnectionConflictDialog } from './components/ConnectionConflictDialog';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Settings } from './components/Settings';
import { notificationService } from './services/notifications';
import { generateId } from './utils/accessibility';

// Lazy load the Dashboard component (contains heavy recharts dependency)
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const ProgressTracking = lazy(() => import('./components/ProgressTracking').then(module => ({ default: module.ProgressTracking })));
const DataExport = lazy(() => import('./components/DataExport').then(module => ({ default: module.DataExport })));
const CompatibilityTestPage = lazy(() => import('./components/CompatibilityTestPage').then(module => ({ default: module.CompatibilityTestPage })));

function App() {
  const { uiState, connectionStatus, error, setUIState, clearError, loadRowersFromDatabase, loadCurrentSession } = useAppStore();
  const { isAvailable, error: bluetoothError, clearError: clearBluetoothError } = useBluetooth();

  // Dynamic aria management for main element based on current view
  const mainElementProps = useMemo(() => {
    const baseId = generateId('main');
    
    switch (uiState.currentView) {
      case 'session':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'dashboard-title'
        };
      case 'progress':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'progress-tracking-title'
        };
      case 'export':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'data-export-title'
        };
      case 'compatibility':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'compatibility-test-title'
        };
      case 'setup':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'device-setup-title'
        };
      case 'settings':
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'settings-title'
        };
      default:
        return {
          id: baseId,
          role: 'main',
          'aria-labelledby': 'dashboard-title'
        };
    }
  }, [uiState.currentView]);

  // Clear errors and load data when component mounts
  useEffect(() => {
    const initializeApp = async () => {
      clearError();
      clearBluetoothError();
      await loadRowersFromDatabase();
      await loadCurrentSession(); // Restore active session if exists
    };
    
    initializeApp();
    
    // Check database usage periodically
    const checkDatabaseUsage = () => {
      notificationService.checkDatabaseUsage();
    };
    
    // Check immediately and then every 5 minutes
    checkDatabaseUsage();
    const interval = setInterval(checkDatabaseUsage, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [clearError, clearBluetoothError, loadRowersFromDatabase, loadCurrentSession]);

  // Show conflict dialog if conflicts are detected
  useEffect(() => {
    if (connectionStatus.hasSpeedCoachConflicts && !uiState.showConflictDialog) {
      setUIState({ showConflictDialog: true });
    }
  }, [connectionStatus.hasSpeedCoachConflicts, uiState.showConflictDialog, setUIState]);

  const renderCurrentView = () => {
    switch (uiState.currentView) {
      case 'setup':
        return <DeviceSetup />;
      case 'progress':
        return (
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <ProgressTracking className="" />
          </Suspense>
        );
      case 'export':
        return (
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <DataExport />
          </Suspense>
        );
      case 'session':
        return (
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <Dashboard />
          </Suspense>
        );
      case 'settings':
        return <Settings />;
      case 'compatibility':
        return (
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <CompatibilityTestPage />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <Dashboard />
          </Suspense>
        );
    }
  };

  if (!isAvailable) {
    return (
      <>
        <section className="error-container">
          <article className="error-content-center">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">
              Bluetooth Not Available
            </h1>
            <p>
              This app requires Bluetooth support. Please use a compatible device.
            </p>
          </article>
        </section>
      </>
    );
  }

  return (
    <ErrorBoundary>
      <>
        <Header />

        <main 
          className="main-container"
          {...mainElementProps}
        >
          {error && (
            <section className="error-message">
              <svg className="error-svg-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <article className="error-text-container">
                <h3 className="error-text-title">Error</h3>
                <p className="error-text-description">{error}</p>
              </article>
              <button onClick={clearError} className="btn btn-secondary">
                <span className="sr-only">Dismiss</span>
                <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </section>
          )}

          {bluetoothError && (
            <section className="warning-message">
              <svg className="warning-svg-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <article className="warning-text-container">
                <h3 className="warning-text-title">Bluetooth Warning
                </h3>
                <p className="warning-text-description">{bluetoothError}</p>
              </article>
            </section>
          )}

          {renderCurrentView()}
        </main>

        <ConnectionConflictDialog />
      </>
    </ErrorBoundary>
  );
}

export default App;
