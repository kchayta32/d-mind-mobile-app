
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Wifi, Bell } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if app is already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = (window.navigator as any).standalone === true;

        if (isStandalone || isIOSStandalone) {
            setIsInstalled(true);
            return;
        }

        // Check if user already dismissed
        const dismissedAt = localStorage.getItem('pwa-install-dismissed');
        if (dismissedAt) {
            const dismissedTime = parseInt(dismissedAt);
            // Don't show for 7 days after dismissal
            if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
                setDismissed(true);
                return;
            }
        }

        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after 5 seconds of browsing
            setTimeout(() => setShowPrompt(true), 5000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Detect when app is installed
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowPrompt(false);
            setDeferredPrompt(null);
        };

        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA install accepted');
            } else {
                console.log('PWA install dismissed');
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
        } catch (e) {
            console.error('Error installing PWA:', e);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    if (isInstalled || dismissed || !showPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 shadow-xl overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 text-white/70 hover:text-white hover:bg-white/10 h-7 w-7"
                    onClick={handleDismiss}
                >
                    <X className="h-4 w-4" />
                </Button>

                <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm flex-shrink-0">
                            <Smartphone className="h-6 w-6 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white text-sm mb-1">
                                ติดตั้ง D-MIND App
                            </h3>
                            <p className="text-white/80 text-xs mb-3">
                                ใช้งานได้เร็วขึ้น รับการแจ้งเตือน และทำงานแบบออฟไลน์
                            </p>

                            {/* Features */}
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-1 text-white/70 text-xs">
                                    <Wifi className="h-3 w-3" />
                                    <span>ออฟไลน์</span>
                                </div>
                                <div className="flex items-center gap-1 text-white/70 text-xs">
                                    <Bell className="h-3 w-3" />
                                    <span>แจ้งเตือน</span>
                                </div>
                            </div>

                            {/* Install Button */}
                            <Button
                                onClick={handleInstall}
                                className="w-full bg-white text-blue-700 hover:bg-blue-50 font-medium text-sm h-9"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                ติดตั้งเลย
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default InstallPrompt;
