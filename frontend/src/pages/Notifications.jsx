import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationItem from '../components/NotificationItem';
import Loader from '../components/Loader';
import { toast } from 'react-hot-toast';
import { HiBell, HiCheckCircle } from "react-icons/hi2";

function Notifications() {
    const { api } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async (pageNum = 1, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const res = await api.get(`/notifications/?page=${pageNum}&limit=20`);
            const { notifications: newNotifications, unreadCount: count, pagination } = res.data.data;

            if (isLoadMore) {
                setNotifications(prev => [...prev, ...newNotifications]);
            } else {
                setNotifications(newNotifications);
            }

            setUnreadCount(count);
            setHasMore(pagination.hasNextPage || newNotifications.length === 20); // Fallback logic if hasNextPage is missing
        } catch (error) {
            console.error("Error fetching notifications", error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [api]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, true);
    };

    const handleMarkRead = async (notificationId) => {
        try {
            await api.patch('/notifications/read', { notificationIds: [notificationId] });
            setNotifications(prev => prev.map(n => 
                n._id === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read", error);
            toast.error("Failed to mark as read");
        }
    };

    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        try {
            await api.patch('/notifications/read', { notificationIds: unreadIds });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success("All marked as read");
        } catch (error) {
            console.error("Error marking all as read", error);
            toast.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await api.delete(`/notifications/delete/${notificationId}`);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            toast.success("Notification deleted");
        } catch (error) {
            console.error("Error deleting notification", error);
            toast.error("Failed to delete notification");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600 dark:text-primary-400">
                        <HiBell size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            {unreadCount} New
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button 
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                        <HiCheckCircle size={18} />
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem 
                            key={notification._id} 
                            notification={notification} 
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <HiBell className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No notifications</h3>
                        <p className="text-gray-500 dark:text-gray-400">You're all caught up!</p>
                    </div>
                )}
            </div>

            {hasMore && notifications.length > 0 && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                    >
                        {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default Notifications;
