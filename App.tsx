import React, { useState, useEffect, useCallback } from 'react';
import { BeforeInstallPromptEvent } from './types';
import { Download, Share, PlusSquare, Smartphone, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // 2. Detect iOS (iPhone/iPad) because they don't support 'beforeinstallprompt'
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Listen for the 'beforeinstallprompt' event (Android/Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
    } else {
      console.log('User dismissed the install prompt');
    }
  }, [deferredPrompt]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-indigo-100">
        
        {/* Header Image Area */}
        <div className="h-40 bg-brand flex items-center justify-center relative">
          <div className="absolute inset-0 bg-black/10"></div>
          <Smartphone className="text-white w-16 h-16 relative z-10" />
        </div>

        {/* Content Area */}
        <div className="p-8 text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Install Demo App</h1>
            <p className="text-gray-600 leading-relaxed">
              Experience the native-like performance by adding this PWA to your home screen.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {/* Case 1: Already Installed */}
            {isInstalled ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-center gap-3 text-green-700">
                <CheckCircle className="w-6 h-6" />
                <span className="font-semibold">App is installed</span>
              </div>
            ) : (
              <>
                {/* Case 2: Android / Desktop Chrome (Supports programmatic install) */}
                {deferredPrompt && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-3 bg-brand hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Download className="w-5 h-5" />
                    Add to Home Screen
                  </button>
                )}

                {/* Case 3: iOS (Does NOT support programmatic install) */}
                {isIOS && !isInstalled && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-left space-y-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="bg-gray-200 text-gray-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">i</span>
                      Install on iPhone/iPad:
                    </p>
                    <div className="text-sm text-gray-600 space-y-2 pl-2">
                      <div className="flex items-center gap-2">
                        <span>1. Tap the</span>
                        <Share className="w-4 h-4 text-blue-500" />
                        <span className="font-bold">Share</span>
                        <span>button below.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>2. Scroll down & tap</span>
                        <PlusSquare className="w-4 h-4 text-gray-600" />
                        <span className="font-bold">Add to Home Screen</span>.
                      </div>
                    </div>
                  </div>
                )}

                {/* Case 4: Browser doesn't support PWA or handler hasn't fired yet */}
                {!deferredPrompt && !isIOS && (
                  <div className="text-sm text-gray-400 italic">
                    If installation is supported, the button will appear here. <br/>
                    (Ensure you are viewing this via HTTPS or on Localhost)
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">PWA Demo &bull; React &bull; Tailwind</p>
        </div>
      </div>
    </div>
  );
};

export default App;