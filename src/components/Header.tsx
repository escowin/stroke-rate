import { useState } from 'react';
import { useAppStore } from '../store';
import { 
  Bars3Icon, 
  Cog6ToothIcon, 
  WifiIcon,
  SignalSlashIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  CpuChipIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { HelpSystem } from './HelpSystem';

export const Header = () => {
  const { uiState, connectionStatus, setUIState } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const connectedDevices = connectionStatus.connectedDevices.length;
  const isConnected = connectedDevices > 0;

  const navigation = [
    { name: 'Dashboard', view: 'dashboard' as const, icon: HeartIcon },
    { name: 'Progress', view: 'progress' as const, icon: ChartBarIcon },
    { name: 'Export', view: 'export' as const, icon: ArrowDownTrayIcon },
    { name: 'Setup', view: 'setup' as const, icon: WifiIcon },
    { name: 'Settings', view: 'settings' as const, icon: Cog6ToothIcon },
    // Only show compatibility test in development
    ...(import.meta.env.DEV ? [{ name: 'Compatibility', view: 'compatibility' as const, icon: CpuChipIcon }] : []),
  ];

  return (
    <header className="header">
        <header className="header-content">
          {/* Logo and Title */}
          <article className="header-brand">
              <HeartIcon className="header-logo-icon" />
              <div className="header-title">
                <h1 className="header-app-name">
                  StrokeRate
                </h1>
                <p className="header-subtitle">
                  Heart Rate Monitor
                </p>
              </div>
          </article>

          {/* Connection Status */}
          <article className="header-status">
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

            {/* Help Button */}
            <button
              onClick={() => setIsHelpOpen(true)}
              className="header-help-button"
              aria-label="Open help system"
            >
              <QuestionMarkCircleIcon className="header-help-icon" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="header-mobile-menu-button"
            >
              <Bars3Icon className="header-mobile-menu-icon" />
            </button>
          </article>
        </header>

        {/* Mobile Navigation Menu */}
        <nav className={`header-mobile-menu ${isMenuOpen ? 'header-mobile-menu--open' : ''}`}>
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
        </nav>

        {/* Desktop Navigation */}
        <nav className="header-desktop-menu">
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
        </nav>

        {/* Help System */}
        <HelpSystem 
          isOpen={isHelpOpen} 
          onClose={() => setIsHelpOpen(false)} 
        />
    </header>
  );
};
