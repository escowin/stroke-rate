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
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo and Title */}
          <div className="header-brand">
            <div className="header-logo">
              <HeartIcon className="header-logo-icon" />
              <div className="header-title">
                <h1 className="header-app-name">
                  StrokeRate
                </h1>
                <p className="header-subtitle">
                  Heart Rate Monitor
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="header-status">
            <div className="header-connection-status">
              {isConnected ? (
                <>
                  <WifiIcon className="header-connection-icon header-connection-icon--connected" />
                  <span className="header-connection-text header-connection-text--connected">
                    {connectedDevices} connected
                  </span>
                </>
              ) : (
                <>
                  <SignalSlashIcon className="header-connection-icon header-connection-icon--disconnected" />
                  <span className="header-connection-text header-connection-text--disconnected">
                    No devices
                  </span>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="header-mobile-menu-button"
            >
              <Bars3Icon className="header-mobile-menu-icon" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`header-mobile-menu ${isMenuOpen ? 'header-mobile-menu--open' : ''}`}>
          <div className="header-mobile-menu-content">
            {navigation.map((item) => {
              const isActive = uiState.currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setUIState({ currentView: item.view });
                    setIsMenuOpen(false);
                  }}
                  className={`header-mobile-nav-button ${
                    isActive
                      ? 'header-mobile-nav-button--active'
                      : 'header-mobile-nav-button--inactive'
                  }`}
                >
                  <item.icon className="header-mobile-nav-icon" />
                  {item.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="header-desktop-menu">
          <div className="header-desktop-menu-content">
            {navigation.map((item) => {
              const isActive = uiState.currentView === item.view;
              return (
                <button
                  key={item.name}
                  onClick={() => setUIState({ currentView: item.view })}
                  className={`header-nav-button ${
                    isActive
                      ? 'header-nav-button--active'
                      : 'header-nav-button--inactive'
                  }`}
                >
                  <item.icon className="header-nav-icon" />
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
