import React from 'react';
import { Home, Phone, MapPin, BookOpen, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        { icon: Home, label: 'หน้าแรก', route: '/' },
        { icon: MapPin, label: 'แผนที่', route: '/risk-zones' },
        { icon: Phone, label: 'ฉุกเฉิน', route: '/contacts' },
        { icon: BookOpen, label: 'คู่มือ', route: '/manual' },
        { icon: Settings, label: 'ตั้งค่า', route: '/notifications' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 pb-[env(safe-area-inset-bottom,0)]">
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/30 shadow-[0_-4px_30px_rgba(0,0,0,0.1)]" />

            <div className="relative grid grid-cols-5 h-16 max-w-md mx-auto px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.route);

                    return (
                        <button
                            key={item.route}
                            onClick={() => navigate(item.route)}
                            className="group flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-90"
                        >
                            <div className={`relative p-2 rounded-2xl transition-all duration-300 ${active
                                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                                : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800'
                                }`}>
                                <Icon className={`w-5 h-5 transition-colors ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                                    }`} />
                                {active && (
                                    <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
                                )}
                            </div>
                            <span className={`text-[10px] font-medium transition-colors ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
