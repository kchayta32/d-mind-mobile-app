import React from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface NotificationToastProps {
    t: string | number; // Toast ID
    title: string;
    description: string;
    type: 'earthquake' | 'flood' | 'wildfire' | 'storm' | 'default';
    onDismiss: () => void;
    onViewMap: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ t, title, description, type, onDismiss, onViewMap }) => {
    const getIcon = () => {
        switch (type) {
            case 'earthquake': return <span className="text-2xl">📉</span>;
            case 'flood': return <span className="text-2xl">🌊</span>;
            case 'wildfire': return <span className="text-2xl">🔥</span>;
            case 'storm': return <span className="text-2xl">🌪️</span>;
            default: return <AlertTriangle className="w-6 h-6 text-orange-500" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'earthquake': return 'border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800';
            case 'flood': return 'border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800';
            case 'wildfire': return 'border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800';
            default: return 'border-gray-200 bg-white dark:bg-slate-900 dark:border-gray-800';
        }
    };

    return (
        <div className={`w-full relative overflow-hidden rounded-xl border shadow-2xl p-4 pr-10 ${getBorderColor()} transition-all duration-300 pointer-events-auto`}>
            {/* Swipe Indicator (Visual cue) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full opacity-50" />

            <div className="flex items-start gap-3 mt-1">
                <div className="shrink-0 p-2 bg-white/80 dark:bg-slate-900/50 rounded-lg backdrop-blur-sm shadow-sm">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">{title}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3 line-clamp-2">
                        {description}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={onViewMap}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
                        >
                            ดูแผนที่
                        </button>
                        <button
                            onClick={() => {
                                onDismiss();
                                toast.dismiss(t);
                            }}
                            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
                        >
                            รับทราบ
                        </button>
                    </div>
                </div>
            </div>

            {/* Close Button (Absolute Top Right) */}
            <button
                onClick={() => {
                    onDismiss();
                    toast.dismiss(t);
                }}
                className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-black/5 hover:bg-black/10 dark:bg-white/5 rounded-full transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default NotificationToast;
