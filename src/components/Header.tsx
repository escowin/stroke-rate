import { useState } from 'react';
import { useAppStore } from '../store';
import { 
  Bars3Icon, 
  Cog6ToothIcon, 
  WifiIcon,
  SignalSlashIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

export const Header = () => {
  const { uiState, connectionStatus, setUIState } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const connectedDevices = connectionStatus.connectedDevices.length;
  const isConnected = connectedDevices > 0;

  const navigation = [
    { name: 'Dashboard', view: 'dashboard' as const, icon: HeartIcon },
    { name: 'Setup', view: 'setup' as const, icon: WifiIcon },
    { name: 'Settings', view: 'settings' as const, icon: Cog6ToothIcon },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <HeartIcon className="h-8 w-8 text-primary-600" />
              <div className="ml-2">
                <h1 className="text-xl font-bold text-gray-900">
                  StrokeRate
                </h1>
                <p className="text-xs text-gray-500">
                  Heart Rate Monitor
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <WifiIcon className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    {connectedDevices} connected
                  </span>
                </>
              ) : (
                <>
                  <SignalSlashIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    No devices
                  </span>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const isActive = uiState.currentView === item.view;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setUIState({ currentView: item.view });
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desktop Navigation */}
        <div className="hidden md:block border-t border-gray-200">
          <div className="flex space-x-8">
            {navigation.map((item) => {
              const isActive = uiState.currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => setUIState({ currentView: item.view })}
                  className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 ${
                    isActive
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
