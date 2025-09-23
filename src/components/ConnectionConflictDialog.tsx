import { useAppStore } from '../store';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ExclamationTriangleIcon,
  XMarkIcon,
  WifiIcon,
  SignalSlashIcon
} from '@heroicons/react/24/outline';

export const ConnectionConflictDialog = () => {
  const { 
    uiState, 
    connectionStatus, 
    setUIState 
  } = useAppStore();

  const { showConflictDialog } = uiState;
  const { conflicts } = connectionStatus;

  const handleClose = () => {
    setUIState({ showConflictDialog: false });
  };

  const handleContinue = () => {
    // In a real implementation, this would handle the SpeedCoach disconnection
    console.log('Continuing with SpeedCoach disconnection...');
    setUIState({ showConflictDialog: false });
  };

  const handleCancel = () => {
    setUIState({ showConflictDialog: false });
  };

  return (
    <Transition appear show={showConflictDialog} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Connection Conflicts Detected
                    </Dialog.Title>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    The following heart rate monitors are currently connected to SpeedCoach devices:
                  </p>
                  
                  <div className="space-y-3">
                    {conflicts.map((conflict) => (
                      <div
                        key={conflict.deviceId}
                        className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-center space-x-3">
                          <WifiIcon className="h-5 w-5 text-yellow-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {conflict.deviceName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Connected to SpeedCoach
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SignalSlashIcon className="h-4 w-4 text-yellow-600" />
                          <span className="text-xs text-yellow-700">
                            Will disconnect
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> To use this app, these devices will need to be disconnected from SpeedCoach and connected to this app instead.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinue}
                    className="flex-1 inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Continue & Disconnect
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
