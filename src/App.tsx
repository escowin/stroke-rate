import { useEffect, lazy, Suspense } from 'react';
import { useAppStore } from './store';
import { useBluetooth } from './hooks/useBluetooth';
import { DeviceSetup } from './components/DeviceSetup';
import { ConnectionConflictDialog } from './components/ConnectionConflictDialog';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load the Dashboard component (contains heavy recharts dependency)
const Dashboard = lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));

function App() {
  const { uiState, connectionStatus, error, setUIState, clearError } = useAppStore();
  const { isAvailable, error: bluetoothError, clearError: clearBluetoothError } = useBluetooth();

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
    clearBluetoothError();
  }, [clearError, clearBluetoothError]);

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
      case 'session':
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          }>
            <Dashboard />
          </Suspense>
        );
      case 'settings':
        return <div className="p-6">Settings coming soon...</div>;
      default:
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          }>
            <Dashboard />
          </Suspense>
        );
    }
  };

  if (!isAvailable) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bluetooth Not Available
          </h1>
          <p className="text-gray-600">
            This app requires Bluetooth support. Please use a compatible device.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="container mx-auto px-4 py-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={clearError}
                    className="text-red-400 hover:text-red-600"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {bluetoothError && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Bluetooth Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>{bluetoothError}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {renderCurrentView()}
        </main>

        <ConnectionConflictDialog />
      </div>
    </ErrorBoundary>
  );
}

export default App;
