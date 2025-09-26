import { useState } from 'react';
import { 
  BookOpenIcon,
  QuestionMarkCircleIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  CommandLineIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { InteractiveTutorial } from './InteractiveTutorial';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
  subsections?: HelpSection[];
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export const HelpSystem = ({ isOpen, onClose, initialSection }: HelpSystemProps) => {
  const [activeSection, setActiveSection] = useState(initialSection || 'getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      content: (
        <div className="help-content">
          <h3>Welcome to Stroke Rate</h3>
          <p>Stroke Rate is a web-based heart rate monitoring application designed specifically for rowing crews. Follow these steps to get started:</p>
          
          <div className="help-tutorial-action">
            <button
              onClick={() => setIsTutorialOpen(true)}
              className="help-tutorial-button"
            >
              <PlayIcon className="help-tutorial-icon" />
              Start Interactive Tutorial
            </button>
            <p className="help-tutorial-description">
              Take a guided tour through all the features of Stroke Rate
            </p>
          </div>
          
          <div className="help-steps">
            <div className="help-step">
              <div className="help-step-number">1</div>
              <div className="help-step-content">
                <h4>Check Compatibility</h4>
                <p>Ensure your browser supports Web Bluetooth API. Chrome and Edge work best.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">2</div>
              <div className="help-step-content">
                <h4>Enable Bluetooth</h4>
                <p>Turn on Bluetooth on your device and grant necessary permissions.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">3</div>
              <div className="help-step-content">
                <h4>Add Rowers</h4>
                <p>Go to Setup and add your rowers with their names and seat numbers.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">4</div>
              <div className="help-step-content">
                <h4>Connect Devices</h4>
                <p>Scan for and connect your heart rate monitors, then assign them to rowers.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">5</div>
              <div className="help-step-content">
                <h4>Start Training</h4>
                <p>Begin your first training session and monitor real-time heart rate data.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'device-setup',
      title: 'Device Setup',
      icon: CogIcon,
      content: (
        <div className="help-content">
          <h3>Setting Up Heart Rate Monitors</h3>
          <p>Follow these steps to connect your heart rate monitors:</p>
          
          <div className="help-tips">
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Supported Devices</h4>
                <p>Garmin, Polar, Wahoo, and most Bluetooth heart rate straps work with Stroke Rate.</p>
              </div>
            </div>
            
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Connection Tips</h4>
                <p>Keep devices within 3 feet, moisten straps for better conductivity, and ensure batteries are charged.</p>
              </div>
            </div>
            
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Multiple Devices</h4>
                <p>You can connect up to 4 heart rate monitors simultaneously, one for each rower seat.</p>
              </div>
            </div>
          </div>
          
          <div className="help-troubleshooting">
            <h4>Common Issues</h4>
            <ul>
              <li><strong>Device not found:</strong> Ensure Bluetooth is enabled and device is in pairing mode</li>
              <li><strong>Connection failed:</strong> Try disconnecting from other apps first</li>
              <li><strong>No data:</strong> Check strap position and ensure it's properly moistened</li>
              <li><strong>iOS Safari:</strong> Use Chrome or Edge browser instead</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'training-sessions',
      title: 'Training Sessions',
      icon: BookOpenIcon,
      content: (
        <div className="help-content">
          <h3>Managing Training Sessions</h3>
          <p>Learn how to start, monitor, and end training sessions:</p>
          
          <div className="help-features">
            <div className="help-feature">
              <h4>Starting a Session</h4>
              <p>Click "Start Session" on the Dashboard. Ensure all heart rate monitors are connected first.</p>
            </div>
            
            <div className="help-feature">
              <h4>During the Session</h4>
              <p>Monitor real-time heart rate data, zone tracking, and connection status for all rowers.</p>
            </div>
            
            <div className="help-feature">
              <h4>Ending a Session</h4>
              <p>Click "End Session" when finished. Session data is automatically saved and can be exported.</p>
            </div>
          </div>
          
          <div className="help-tips">
            <div className="help-tip">
              <ExclamationTriangleIcon className="help-tip-icon warning" />
              <div className="help-tip-content">
                <h4>Important</h4>
                <p>Always end sessions manually to ensure data is properly saved.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'heart-rate-zones',
      title: 'Heart Rate Zones',
      icon: BookOpenIcon,
      content: (
        <div className="help-content">
          <h3>Understanding Heart Rate Zones</h3>
          <p>Heart rate zones help you train at the right intensity for your goals:</p>
          
          <div className="help-zones">
            <div className="help-zone recovery">
              <div className="help-zone-color"></div>
              <div className="help-zone-content">
                <h4>Recovery Zone</h4>
                <p><strong>50-60% max HR</strong></p>
                <p>Light intensity, perfect for warm-up and cool-down</p>
              </div>
            </div>
            
            <div className="help-zone aerobic">
              <div className="help-zone-color"></div>
              <div className="help-zone-content">
                <h4>Aerobic Zone</h4>
                <p><strong>60-70% max HR</strong></p>
                <p>Moderate intensity, improves cardiovascular fitness</p>
              </div>
            </div>
            
            <div className="help-zone threshold">
              <div className="help-zone-color"></div>
              <div className="help-zone-content">
                <h4>Threshold Zone</h4>
                <p><strong>70-80% max HR</strong></p>
                <p>High intensity, improves lactate threshold</p>
              </div>
            </div>
            
            <div className="help-zone anaerobic">
              <div className="help-zone-color"></div>
              <div className="help-zone-content">
                <h4>Anaerobic Zone</h4>
                <p><strong>80-90% max HR</strong></p>
                <p>Very high intensity, improves power and speed</p>
              </div>
            </div>
          </div>
          
          <div className="help-tips">
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Custom Zones</h4>
                <p>You can set custom heart rate zones for each rower in the Setup page.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-export',
      title: 'Data Export',
      icon: DocumentTextIcon,
      content: (
        <div className="help-content">
          <h3>Exporting Your Data</h3>
          <p>Export session data for analysis, sharing, or backup:</p>
          
          <div className="help-steps">
            <div className="help-step">
              <div className="help-step-number">1</div>
              <div className="help-step-content">
                <h4>Go to Export</h4>
                <p>Click "Export" in the main navigation to access the export page.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">2</div>
              <div className="help-step-content">
                <h4>Select Sessions</h4>
                <p>Choose which training sessions you want to export.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">3</div>
              <div className="help-step-content">
                <h4>Choose Format</h4>
                <p>Select CSV for spreadsheets or JSON for other applications.</p>
              </div>
            </div>
            
            <div className="help-step">
              <div className="help-step-number">4</div>
              <div className="help-step-content">
                <h4>Download</h4>
                <p>Click "Download" to save the exported data file.</p>
              </div>
            </div>
          </div>
          
          <div className="help-tips">
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Data Included</h4>
                <p>Exported data includes heart rate readings, timestamps, zones, and session information.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: WrenchScrewdriverIcon,
      content: (
        <div className="help-content">
          <h3>Common Problems and Solutions</h3>
          <p>Here are solutions to the most common issues:</p>
          
          <div className="help-troubleshooting">
            <div className="help-issue">
              <h4>Heart Rate Monitor Won't Connect</h4>
              <ul>
                <li>Ensure Bluetooth is enabled on your device</li>
                <li>Check that the heart rate monitor is in pairing mode</li>
                <li>Try disconnecting from other apps first</li>
                <li>Keep devices within 3 feet of each other</li>
                <li>Check device battery level</li>
              </ul>
            </div>
            
            <div className="help-issue">
              <h4>No Heart Rate Data</h4>
              <ul>
                <li>Check that the heart rate strap is properly positioned</li>
                <li>Ensure the strap is moist for better conductivity</li>
                <li>Verify the device battery is charged</li>
                <li>Try reconnecting the device</li>
              </ul>
            </div>
            
            <div className="help-issue">
              <h4>App Won't Load</h4>
              <ul>
                <li>Check your internet connection</li>
                <li>Clear browser cache and cookies</li>
                <li>Try refreshing the page</li>
                <li>Use a supported browser (Chrome, Edge, Safari)</li>
              </ul>
            </div>
            
            <div className="help-issue">
              <h4>iOS Safari Issues</h4>
              <ul>
                <li>iOS Safari doesn't support Web Bluetooth API</li>
                <li>Use Chrome or Edge browser instead</li>
                <li>Or use the app for data viewing only</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      icon: EyeIcon,
      content: (
        <div className="help-content">
          <h3>Accessibility Features</h3>
          <p>Stroke Rate includes comprehensive accessibility features for users with disabilities:</p>
          
          <div className="help-features">
            <div className="help-feature">
              <h4>Screen Reader Support</h4>
              <p>Full compatibility with screen readers. Heart rate updates and status changes are announced automatically.</p>
            </div>
            
            <div className="help-feature">
              <h4>Keyboard Navigation</h4>
              <p>Complete keyboard-only operation. Use Tab to navigate and Enter/Space to activate controls.</p>
            </div>
            
            <div className="help-feature">
              <h4>High Contrast</h4>
              <p>High contrast mode for better visibility. Heart rate zones use both color and text labels.</p>
            </div>
            
            <div className="help-feature">
              <h4>Voice Announcements</h4>
              <p>Real-time heart rate updates and status changes are announced automatically.</p>
            </div>
          </div>
          
          <div className="help-tips">
            <div className="help-tip">
              <CheckCircleIcon className="help-tip-icon" />
              <div className="help-tip-content">
                <h4>Keyboard Shortcuts</h4>
                <p>Use Tab to navigate, Enter/Space to activate, and Escape to close dialogs.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      icon: CommandLineIcon,
      content: (
        <div className="help-content">
          <h3>Keyboard Shortcuts</h3>
          <p>Use these keyboard shortcuts for faster navigation:</p>
          
          <div className="help-shortcuts">
            <div className="help-shortcut-category">
              <h4>Navigation</h4>
              <div className="help-shortcut-list">
                <div className="help-shortcut">
                  <kbd>Tab</kbd>
                  <span>Move to next interactive element</span>
                </div>
                <div className="help-shortcut">
                  <kbd>Shift + Tab</kbd>
                  <span>Move to previous interactive element</span>
                </div>
                <div className="help-shortcut">
                  <kbd>Enter</kbd>
                  <span>Activate buttons and links</span>
                </div>
                <div className="help-shortcut">
                  <kbd>Space</kbd>
                  <span>Activate buttons and links</span>
                </div>
                <div className="help-shortcut">
                  <kbd>Escape</kbd>
                  <span>Close dialogs and menus</span>
                </div>
              </div>
            </div>
            
            <div className="help-shortcut-category">
              <h4>Page Navigation</h4>
              <div className="help-shortcut-list">
                <div className="help-shortcut">
                  <kbd>D</kbd>
                  <span>Go to Dashboard</span>
                </div>
                <div className="help-shortcut">
                  <kbd>S</kbd>
                  <span>Go to Setup</span>
                </div>
                <div className="help-shortcut">
                  <kbd>P</kbd>
                  <span>Go to Progress</span>
                </div>
                <div className="help-shortcut">
                  <kbd>E</kbd>
                  <span>Go to Export</span>
                </div>
              </div>
            </div>
            
            <div className="help-shortcut-category">
              <h4>Session Controls</h4>
              <div className="help-shortcut-list">
                <div className="help-shortcut">
                  <kbd>Space</kbd>
                  <span>Start/pause session (when focused on start button)</span>
                </div>
                <div className="help-shortcut">
                  <kbd>Escape</kbd>
                  <span>End session (when focused on end button)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.id.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleSectionClick = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  if (!isOpen) return null;

  return (
    <div className="help-system-overlay">
      <div className="help-system">
        <div className="help-system-header">
          <h2 className="help-system-title">
            <QuestionMarkCircleIcon className="help-system-title-icon" />
            Help & Documentation
          </h2>
          <button
            onClick={onClose}
            className="help-system-close"
            aria-label="Close help system"
          >
            <XMarkIcon className="help-system-close-icon" />
          </button>
        </div>

        <div className="help-system-content">
          <div className="help-system-sidebar">
            <div className="help-system-search">
              <MagnifyingGlassIcon className="help-system-search-icon" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="help-system-search-input"
              />
            </div>

            <nav className="help-system-nav">
              {filteredSections.map((section) => (
                <div key={section.id} className="help-system-nav-item">
                  <button
                    onClick={() => handleSectionClick(section.id)}
                    className={`help-system-nav-button ${
                      activeSection === section.id ? 'help-system-nav-button--active' : ''
                    }`}
                  >
                    <section.icon className="help-system-nav-icon" />
                    <span className="help-system-nav-text">{section.title}</span>
                  </button>
                </div>
              ))}
            </nav>
          </div>

          <div className="help-system-main">
            {helpSections.find(section => section.id === activeSection)?.content}
          </div>
        </div>

        {/* Interactive Tutorial */}
        <InteractiveTutorial 
          isOpen={isTutorialOpen}
          onClose={() => setIsTutorialOpen(false)}
          onComplete={() => {
            setIsTutorialOpen(false);
            // Optionally show completion message
          }}
        />
      </div>
    </div>
  );
};
