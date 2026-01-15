
import { useState, useEffect, useCallback } from 'react';

export interface NotificationHistoryItem {
    id: string;
    title: string;
    body: string;
    type: 'disaster' | 'alert' | 'info' | 'emergency';
    timestamp: Date;
    read: boolean;
    severity?: number;
    location?: string;
    data?: Record<string, unknown>;
}

const STORAGE_KEY = 'dmind-notification-history';
const MAX_HISTORY_ITEMS = 100;

export const useNotificationHistory = () => {
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Load history from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as NotificationHistoryItem[];
                // Convert timestamp strings back to Date objects
                const withDates = parsed.map(item => ({
                    ...item,
                    timestamp: new Date(item.timestamp)
                }));
                setHistory(withDates);
                setUnreadCount(withDates.filter(item => !item.read).length);
            }
        } catch (e) {
            console.error('Error loading notification history:', e);
        }
    }, []);

    // Save history to localStorage whenever it changes
    const saveHistory = useCallback((items: NotificationHistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('Error saving notification history:', e);
        }
    }, []);

    // Add a new notification to history
    const addNotification = useCallback((notification: Omit<NotificationHistoryItem, 'id' | 'timestamp' | 'read'>) => {
        const newItem: NotificationHistoryItem = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            read: false
        };

        setHistory(prev => {
            const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
            saveHistory(updated);
            return updated;
        });

        setUnreadCount(prev => prev + 1);

        return newItem;
    }, [saveHistory]);

    // Mark a notification as read
    const markAsRead = useCallback((id: string) => {
        setHistory(prev => {
            const updated = prev.map(item =>
                item.id === id ? { ...item, read: true } : item
            );
            saveHistory(updated);
            return updated;
        });
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, [saveHistory]);

    // Mark all notifications as read
    const markAllAsRead = useCallback(() => {
        setHistory(prev => {
            const updated = prev.map(item => ({ ...item, read: true }));
            saveHistory(updated);
            return updated;
        });
        setUnreadCount(0);
    }, [saveHistory]);

    // Delete a notification
    const deleteNotification = useCallback((id: string) => {
        setHistory(prev => {
            const itemToDelete = prev.find(item => item.id === id);
            const updated = prev.filter(item => item.id !== id);
            saveHistory(updated);
            if (itemToDelete && !itemToDelete.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            return updated;
        });
    }, [saveHistory]);

    // Clear all history
    const clearHistory = useCallback(() => {
        setHistory([]);
        setUnreadCount(0);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Get notifications by type
    const getByType = useCallback((type: NotificationHistoryItem['type']) => {
        return history.filter(item => item.type === type);
    }, [history]);

    // Get recent notifications (last 24 hours)
    const getRecent = useCallback(() => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return history.filter(item => item.timestamp > dayAgo);
    }, [history]);

    // Get emergency notifications
    const getEmergencyNotifications = useCallback(() => {
        return history.filter(item => item.type === 'emergency' || (item.severity && item.severity >= 4));
    }, [history]);

    return {
        history,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearHistory,
        getByType,
        getRecent,
        getEmergencyNotifications
    };
};
