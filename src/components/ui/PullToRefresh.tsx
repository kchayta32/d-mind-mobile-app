import React, { useState, useRef, useCallback } from 'react';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number;
    disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
    onRefresh,
    children,
    threshold = 80,
    disabled = false
}) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const startY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing) return;

        // Only start pull if at top of container
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const distance = Math.max(0, (currentY - startY.current) * 0.5);

        if (distance > 0) {
            e.preventDefault();
            setPullDistance(Math.min(distance, threshold * 1.5));
        }
    }, [isPulling, disabled, isRefreshing, threshold]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling || disabled) return;

        setIsPulling(false);

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true);
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
            }
        }

        setPullDistance(0);
    }, [isPulling, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

    const pullProgress = Math.min(pullDistance / threshold, 1);
    const showIndicator = isPulling || isRefreshing || pullDistance > 0;

    return (
        <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="h-full overflow-auto"
        >
            {/* Pull indicator */}
            <div
                className={`flex items-center justify-center transition-all duration-200 overflow-hidden ${showIndicator ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ height: isRefreshing ? 60 : pullDistance }}
            >
                <div className="flex flex-col items-center gap-1">
                    {isRefreshing ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                        <div
                            className="transition-transform duration-200"
                            style={{
                                transform: `rotate(${pullProgress * 180}deg)`,
                                opacity: pullProgress
                            }}
                        >
                            <ArrowDown className={`w-5 h-5 ${pullProgress >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                        {isRefreshing
                            ? 'กำลังรีเฟรช...'
                            : pullProgress >= 1
                                ? 'ปล่อยเพื่อรีเฟรช'
                                : 'ดึงลงเพื่อรีเฟรช'}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div
                style={{
                    transform: isRefreshing ? 'translateY(0)' : `translateY(${pullDistance * 0.3}px)`,
                    transition: isPulling ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
