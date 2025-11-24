// Standard interface for the BeforeInstallPromptEvent
// This event is fired by Chrome/Edge on Android/Desktop
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    // Add the event to the global window type
    deferredPrompt?: BeforeInstallPromptEvent;
  }
}