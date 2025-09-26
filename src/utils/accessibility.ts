/**
 * Accessibility Utilities and Helpers
 * 
 * This module provides utilities for improving accessibility compliance
 * including ARIA attributes, keyboard navigation, and screen reader support.
 */

/**
 * Generate unique IDs for accessibility attributes
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * ARIA live region announcements for screen readers
 */
export class AccessibilityAnnouncer {
  private static instance: AccessibilityAnnouncer;
  private liveRegion: HTMLElement | null = null;

  static getInstance(): AccessibilityAnnouncer {
    if (!AccessibilityAnnouncer.instance) {
      AccessibilityAnnouncer.instance = new AccessibilityAnnouncer();
    }
    return AccessibilityAnnouncer.instance;
  }

  private constructor() {
    this.createLiveRegion();
  }

  private createLiveRegion(): void {
    if (typeof document === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
  }

  announceHeartRateUpdate(rowerName: string, heartRate: number, zone: string): void {
    this.announce(`${rowerName} heart rate: ${heartRate} BPM, ${zone} zone`);
  }

  announceDeviceConnection(deviceName: string, connected: boolean): void {
    this.announce(`${deviceName} ${connected ? 'connected' : 'disconnected'}`);
  }

  announceSessionStatus(started: boolean): void {
    this.announce(`Training session ${started ? 'started' : 'ended'}`);
  }

  announceError(message: string): void {
    this.announce(`Error: ${message}`, 'assertive');
  }
}

/**
 * Keyboard navigation utilities
 */
export const KeyboardNavigation = {
  // Common key codes
  KEYS: {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown'
  },

  // Check if key is a navigation key
  isNavigationKey(key: string): boolean {
    return Object.values(this.KEYS).includes(key);
  },

  // Handle arrow key navigation for lists
  handleArrowNavigation(
    event: React.KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (index: number) => void
  ): void {
    const { key } = event;
    
    switch (key) {
      case this.KEYS.ARROW_UP:
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        onNavigate(prevIndex);
        break;
      case this.KEYS.ARROW_DOWN:
        event.preventDefault();
        const nextIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        onNavigate(nextIndex);
        break;
      case this.KEYS.HOME:
        event.preventDefault();
        onNavigate(0);
        break;
      case this.KEYS.END:
        event.preventDefault();
        onNavigate(totalItems - 1);
        break;
    }
  },

  // Handle enter/space activation
  handleActivation(event: React.KeyboardEvent, onActivate: () => void): void {
    if (event.key === this.KEYS.ENTER || event.key === this.KEYS.SPACE) {
      event.preventDefault();
      onActivate();
    }
  }
};

/**
 * Focus management utilities
 */
export const FocusManagement = {
  // Trap focus within an element
  trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      element.removeEventListener('keydown', handleTabKey);
    };
  },

  // Restore focus to a specific element
  restoreFocus(element: HTMLElement | null): void {
    if (element) {
      element.focus();
    }
  },

  // Move focus to next focusable element
  moveToNext(element: HTMLElement): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(element);
    const nextElement = focusableElements[currentIndex + 1] as HTMLElement;
    nextElement?.focus();
  },

  // Move focus to previous focusable element
  moveToPrevious(element: HTMLElement): void {
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const currentIndex = Array.from(focusableElements).indexOf(element);
    const previousElement = focusableElements[currentIndex - 1] as HTMLElement;
    previousElement?.focus();
  }
};

/**
 * Color contrast utilities
 */
export const ColorContrast = {
  // Calculate relative luminance
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio
  getContrastRatio(color1: string, color2: string): number {
    const parseColor = (color: string) => {
      const hex = color.replace('#', '');
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16)
      };
    };

    const c1 = parseColor(color1);
    const c2 = parseColor(color2);
    const l1 = this.getLuminance(c1.r, c1.g, c1.b);
    const l2 = this.getLuminance(c2.r, c2.g, c2.b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if contrast meets WCAG standards
  meetsWCAG(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
};

/**
 * Screen reader utilities
 */
export const ScreenReader = {
  // Hide element from screen readers
  hideFromScreenReader(element: HTMLElement): void {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show element to screen readers
  showToScreenReader(element: HTMLElement): void {
    element.removeAttribute('aria-hidden');
  },

  // Make element visible only to screen readers
  makeScreenReaderOnly(element: HTMLElement): void {
    element.className = 'sr-only';
    element.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
  },

  // Announce changes to screen readers
  announceChange(element: HTMLElement, message: string): void {
    element.setAttribute('aria-label', message);
    // Force screen reader to re-read the element
    element.setAttribute('aria-live', 'polite');
    setTimeout(() => element.removeAttribute('aria-live'), 1000);
  }
};

/**
 * Form accessibility utilities
 */
export const FormAccessibility = {
  // Generate accessible form field IDs
  generateFieldId(label: string, formId?: string): string {
    const baseId = label.toLowerCase().replace(/\s+/g, '-');
    return formId ? `${formId}-${baseId}` : baseId;
  },

  // Create accessible form field props
  createFieldProps(
    id: string,
    label: string,
    required: boolean = false,
    describedBy?: string
  ) {
    return {
      id,
      'aria-label': label,
      'aria-required': required,
      'aria-describedby': describedBy,
      required
    };
  },

  // Create accessible error message props
  createErrorProps(fieldId: string, errorId: string) {
    return {
      id: errorId,
      role: 'alert',
      'aria-live': 'assertive' as const,
      'aria-describedby': fieldId
    };
  }
};

/**
 * Heart rate specific accessibility utilities
 */
export const HeartRateAccessibility = {
  // Generate accessible heart rate description
  getHeartRateDescription(heartRate: number, zone: string, rowerName: string): string {
    return `${rowerName} heart rate: ${heartRate} beats per minute, ${zone} zone`;
  },

  // Generate accessible zone description
  getZoneDescription(zone: string, heartRate: number): string {
    const zoneDescriptions = {
      recovery: 'Recovery zone - low intensity, good for warm-up and cool-down',
      aerobic: 'Aerobic zone - moderate intensity, improves cardiovascular fitness',
      threshold: 'Threshold zone - high intensity, improves lactate threshold',
      anaerobic: 'Anaerobic zone - very high intensity, improves power and speed'
    };
    
    return `${zoneDescriptions[zone as keyof typeof zoneDescriptions] || zone} at ${heartRate} BPM`;
  },

  // Generate accessible connection status description
  getConnectionStatusDescription(connected: boolean, deviceName: string): string {
    return `${deviceName} heart rate monitor ${connected ? 'connected and transmitting data' : 'disconnected'}`;
  }
};

/**
 * Session accessibility utilities
 */
export const SessionAccessibility = {
  // Generate accessible session status description
  getSessionStatusDescription(active: boolean, startTime?: Date, duration?: number): string {
    if (!active) {
      return 'Training session not active';
    }
    
    const timeStr = startTime ? `started at ${startTime.toLocaleTimeString()}` : 'in progress';
    const durationStr = duration ? `, duration: ${Math.floor(duration / 60)} minutes` : '';
    
    return `Training session ${timeStr}${durationStr}`;
  },

  // Generate accessible rower count description
  getRowerCountDescription(count: number, connected: number): string {
    if (count === 0) {
      return 'No rowers configured';
    }
    
    if (connected === count) {
      return `All ${count} rower${count === 1 ? '' : 's'} connected`;
    }
    
    return `${connected} of ${count} rower${count === 1 ? '' : 's'} connected`;
  }
};
