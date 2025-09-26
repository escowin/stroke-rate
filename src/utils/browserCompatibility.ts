/**
 * Browser Compatibility Detection and Testing Utilities
 * 
 * This module provides comprehensive browser compatibility detection
 * for the Stroke Rate app, with special focus on Web Bluetooth API support
 * and iOS Safari limitations.
 */

export interface BrowserInfo {
  name: string;
  version: string;
  platform: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isFirefox: boolean;
  isEdge: boolean;
  supportsWebBluetooth: boolean;
  supportsPWA: boolean;
  supportsNotifications: boolean;
  supportsIndexedDB: boolean;
  userAgent: string;
}

export interface CompatibilityReport {
  browser: BrowserInfo;
  isFullySupported: boolean;
  isPartiallySupported: boolean;
  isNotSupported: boolean;
  missingFeatures: string[];
  warnings: string[];
  recommendations: string[];
  gracefulDegradation: {
    canViewData: boolean;
    canExportData: boolean;
    canUseOfflineFeatures: boolean;
    bluetoothFeatures: 'full' | 'limited' | 'none';
  };
}

/**
 * Detect browser information from user agent and feature detection
 */
export function detectBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Basic browser detection
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  
  // Platform detection
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(userAgent);
  const isMobile = isIOS || isAndroid || /Mobile/.test(userAgent);
  
  // Version detection (simplified)
  const version = extractVersion(userAgent);
  
  // Feature detection
  const supportsWebBluetooth = 'bluetooth' in navigator;
  const supportsPWA = 'serviceWorker' in navigator && 'PushManager' in window;
  const supportsNotifications = 'Notification' in window;
  const supportsIndexedDB = 'indexedDB' in window;
  
  return {
    name: getBrowserName(userAgent, isChrome, isSafari, isFirefox, isEdge),
    version,
    platform: isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop',
    isMobile,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    supportsWebBluetooth,
    supportsPWA,
    supportsNotifications,
    supportsIndexedDB,
    userAgent
  };
}

/**
 * Generate comprehensive compatibility report
 */
export function generateCompatibilityReport(): CompatibilityReport {
  const browser = detectBrowserInfo();
  const missingFeatures: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  // Check for missing features
  if (!browser.supportsWebBluetooth) {
    missingFeatures.push('Web Bluetooth API');
  }
  
  if (!browser.supportsPWA) {
    missingFeatures.push('Progressive Web App features');
  }
  
  if (!browser.supportsNotifications) {
    missingFeatures.push('Push Notifications');
  }
  
  if (!browser.supportsIndexedDB) {
    missingFeatures.push('IndexedDB (local storage)');
  }
  
  // Platform-specific warnings and recommendations
  if (browser.isIOS && browser.isSafari) {
    warnings.push('iOS Safari does not support Web Bluetooth API');
    recommendations.push('Use Chrome or Edge on iOS for full functionality');
    recommendations.push('Consider using a dedicated Android device for heart rate monitoring');
  }
  
  if (browser.isAndroid && !browser.isChrome) {
    warnings.push('Web Bluetooth API is only fully supported in Chrome on Android');
    recommendations.push('Use Chrome browser for best compatibility');
  }
  
  if (browser.isMobile && !browser.supportsPWA) {
    warnings.push('PWA features may not work properly on this device');
  }
  
  // Determine support levels
  const isFullySupported = missingFeatures.length === 0;
  const isPartiallySupported = missingFeatures.length > 0 && missingFeatures.length < 3;
  const isNotSupported = missingFeatures.length >= 3;
  
  // Graceful degradation assessment
  const gracefulDegradation = {
    canViewData: browser.supportsIndexedDB,
    canExportData: browser.supportsIndexedDB,
    canUseOfflineFeatures: browser.supportsPWA,
    bluetoothFeatures: (browser.supportsWebBluetooth ? 'full' : browser.isIOS ? 'none' : 'limited') as 'full' | 'limited' | 'none'
  };
  
  return {
    browser,
    isFullySupported,
    isPartiallySupported,
    isNotSupported,
    missingFeatures,
    warnings,
    recommendations,
    gracefulDegradation
  };
}

/**
 * Get user-friendly browser name
 */
function getBrowserName(_userAgent: string, isChrome: boolean, isSafari: boolean, isFirefox: boolean, isEdge: boolean): string {
  if (isChrome) return 'Chrome';
  if (isSafari) return 'Safari';
  if (isFirefox) return 'Firefox';
  if (isEdge) return 'Edge';
  return 'Unknown';
}

/**
 * Extract version number from user agent
 */
function extractVersion(userAgent: string): string {
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  if (chromeMatch) return chromeMatch[1];
  
  const safariMatch = userAgent.match(/Version\/(\d+)/);
  if (safariMatch) return safariMatch[1];
  
  const firefoxMatch = userAgent.match(/Firefox\/(\d+)/);
  if (firefoxMatch) return firefoxMatch[1];
  
  const edgeMatch = userAgent.match(/Edg\/(\d+)/);
  if (edgeMatch) return edgeMatch[1];
  
  return 'Unknown';
}

/**
 * Test Web Bluetooth API functionality
 */
export async function testWebBluetoothSupport(): Promise<{
  isSupported: boolean;
  error?: string;
  capabilities: {
    canRequestDevice: boolean;
    canConnect: boolean;
    canReadCharacteristics: boolean;
  };
}> {
  const capabilities = {
    canRequestDevice: false,
    canConnect: false,
    canReadCharacteristics: false
  };
  
  if (!('bluetooth' in navigator)) {
    return {
      isSupported: false,
      error: 'Web Bluetooth API not available',
      capabilities
    };
  }
  
  try {
    // Test basic API availability
    const bluetooth = (navigator as any).bluetooth;
    
    if (typeof bluetooth.requestDevice === 'function') {
      capabilities.canRequestDevice = true;
    }
    
    // Note: We can't actually test connection without user interaction
    // This would require a real device and user permission
    
    return {
      isSupported: true,
      capabilities
    };
  } catch (error) {
    return {
      isSupported: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      capabilities
    };
  }
}

/**
 * Get compatibility status for UI display
 */
export function getCompatibilityStatus(): {
  status: 'supported' | 'partial' | 'unsupported';
  message: string;
  icon: string;
  canProceed: boolean;
} {
  const report = generateCompatibilityReport();
  
  if (report.isFullySupported) {
    return {
      status: 'supported',
      message: 'Your browser fully supports all features',
      icon: '✅',
      canProceed: true
    };
  }
  
  if (report.isPartiallySupported) {
    return {
      status: 'partial',
      message: 'Some features may not be available',
      icon: '⚠️',
      canProceed: true
    };
  }
  
  if (report.browser.isIOS && report.browser.isSafari) {
    return {
      status: 'unsupported',
      message: 'iOS Safari does not support heart rate monitoring. Use Chrome or Edge for full functionality.',
      icon: '❌',
      canProceed: false
    };
  }
  
  return {
    status: 'unsupported',
    message: 'Your browser does not support the required features',
    icon: '❌',
    canProceed: false
  };
}

/**
 * Generate detailed compatibility report for debugging
 */
export function getDetailedCompatibilityReport(): string {
  const report = generateCompatibilityReport();
  
  return `
Browser Compatibility Report
============================

Browser: ${report.browser.name} ${report.browser.version}
Platform: ${report.browser.platform}
Mobile: ${report.browser.isMobile ? 'Yes' : 'No'}
User Agent: ${report.browser.userAgent}

Feature Support:
- Web Bluetooth API: ${report.browser.supportsWebBluetooth ? '✅' : '❌'}
- PWA Support: ${report.browser.supportsPWA ? '✅' : '❌'}
- Notifications: ${report.browser.supportsNotifications ? '✅' : '❌'}
- IndexedDB: ${report.browser.supportsIndexedDB ? '✅' : '❌'}

Support Level: ${report.isFullySupported ? 'Full' : report.isPartiallySupported ? 'Partial' : 'None'}

Graceful Degradation:
- Can view data: ${report.gracefulDegradation.canViewData ? 'Yes' : 'No'}
- Can export data: ${report.gracefulDegradation.canExportData ? 'Yes' : 'No'}
- Can use offline features: ${report.gracefulDegradation.canUseOfflineFeatures ? 'Yes' : 'No'}
- Bluetooth features: ${report.gracefulDegradation.bluetoothFeatures}

${report.warnings.length > 0 ? `Warnings:\n${report.warnings.map(w => `- ${w}`).join('\n')}` : ''}

${report.recommendations.length > 0 ? `Recommendations:\n${report.recommendations.map(r => `- ${r}`).join('\n')}` : ''}
  `.trim();
}
