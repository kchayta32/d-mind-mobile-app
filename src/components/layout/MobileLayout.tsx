import * as React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { Button } from '../ui/button';
import { Moon, Sun, Globe } from 'lucide-react';
import NotificationManager from '../notifications/NotificationManager';
import { useTheme } from '@/contexts/ThemeContext';

const MobileLayout: React.FC = () => {
    const { isDark, toggleTheme } = useTheme();
    const [language, setLanguage] = React.useState('th' as 'th' | 'en');
    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';


    return (
        <div className="min-h-screen bg-background pb-24">
            <NotificationManager />

            {/* Global Mobile Header - Only show on Home Page */}
            {isHomePage && (
                <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-40">
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                <img
                                    src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png"
                                    alt="D-MIND Logo"
                                    className="h-9 w-9"
                                />
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">D-MIND</h1>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Disaster Monitor</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={toggleTheme}
                                >
                                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                                >
                                    <Globe className="h-3 w-3 mr-1" />
                                    <span className="text-xs">{language.toUpperCase()}</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Main Content Area */}
            <main className="w-full">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
};

export default MobileLayout;
