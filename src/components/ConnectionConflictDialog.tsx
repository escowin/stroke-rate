import { useAppStore } from '../store';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';
import { BluetoothService } from '../services/bluetooth';

export const ConnectionConflictDialog = () => {
  const {
    uiState,
    connectionStatus,
    setUIState
  } = useAppStore();

  const { showConflictDialog } = uiState;
  const { conflicts } = connectionStatus;
  const [isProcessing, setIsProcessing] = useState(false);

  const bluetoothService = BluetoothService.getInstance();

  const handleClose = () => {
    setUIState({ showConflictDialog: false });
  };

  const handleContinue = async () => {
    setIsProcessing(true);
    try {
      // Handle SpeedCoach disconnection
      const success = await bluetoothService.handleSpeedCoachDisconnection(conflicts);

      if (success) {
        console.log('SpeedCoach disconnection handled successfully');
        // Optionally trigger a new scan to refresh available devices
        // This would be handled by the parent component
      } else {
        console.error('Failed to handle SpeedCoach disconnection');
      }
    } catch (error) {
      console.error('Error handling SpeedCoach disconnection:', error);
    } finally {
      setIsProcessing(false);
      setUIState({ showConflictDialog: false });
    }
  };

  const handleCancel = () => {
    setUIState({ showConflictDialog: false });
  };

  return (
    <Transition appear show={showConflictDialog} as={Fragment}>
      <Dialog as="div" className="dialog-overlay" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="dialog-overlay" />
        </Transition.Child>

        <div className="dialog-container">
          <div className="dialog-content">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="dialog-panel">
                <header className="dialog-header">
                  <div className="dialog-title-container">
                    <div className="dialog-icon-container">
                      <ExclamationTriangleIcon className="dialog-icon" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="dialog-title"
                    >
                      Connection Conflicts Detected
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className="dialog-close-button"
                  >
                    <XMarkIcon className="dialog-close-icon" />
                  </button>
                </header>

                <div className="dialog-body">
                  <p className="dialog-description">
                    The following heart rate monitors are currently connected to SpeedCoach devices:
                  </p>

                  <div className="dialog-conflict-list">
                    {conflicts.map((conflict) => (
                      <div
                        key={conflict.deviceId}
                        className="dialog-conflict-item"
                      >
                        <div className="dialog-conflict-info">
                          <WifiIcon className="dialog-conflict-icon" />
                          <div className="dialog-conflict-details">
                            <p className="dialog-conflict-name">
                              {conflict.deviceName}
                            </p>
                            <p className="dialog-conflict-status">
                              Connected to SpeedCoach
                            </p>
                          </div>
                        </div>
                        <div className="dialog-conflict-actions">
                          <SignalSlashIcon className="dialog-conflict-warning-icon" />
                          <span className="dialog-conflict-warning-text">
                            Will disconnect
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="dialog-note">
                    <p className="dialog-note-text">
                      <strong>Note:</strong> To use this app, these devices will need to be disconnected from SpeedCoach and connected to this app instead.
                    </p>
                  </div>
                </div>

                <div className="dialog-actions">
                  <button
                    onClick={handleCancel}
                    className="dialog-button dialog-button--secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    disabled={isProcessing}
                    className="dialog-button dialog-button--primary"
                  >
                    {isProcessing ? 'Processing...' : 'Continue & Disconnect'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
