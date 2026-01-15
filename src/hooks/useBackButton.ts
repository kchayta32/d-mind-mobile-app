import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle Android hardware back button
 * - On home page ('/'): minimize/exit app
 * - On other pages: navigate to home page
 */
export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Only set up listener for native platforms
        if (!Capacitor.isNativePlatform()) {
            return;
        }

        const handleBackButton = () => {
            const currentPath = location.pathname;

            // If on home page, let the app exit/minimize
            if (currentPath === '/') {
                // Exit the app or minimize (default Capacitor behavior)
                CapacitorApp.exitApp();
                return;
            }

            // On any other page, navigate to home
            navigate('/', { replace: true });
        };

        // Add back button listener
        const listener = CapacitorApp.addListener('backButton', handleBackButton);

        return () => {
            // Cleanup listener
            listener.then(l => l.remove());
        };
    }, [navigate, location.pathname]);
};
