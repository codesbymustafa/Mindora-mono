import React from 'react';
import { Link } from 'react-router-dom';
import { HiHeart, HiChatBubbleLeft, HiUserPlus, HiVideoCamera, HiTrash, HiCheck } from "react-icons/hi2";

function NotificationItem({ notification, onMarkRead, onDelete }) {
    const { type, message, sender, relatedVideo, relatedTweet, relatedComment, isRead, createdAt } = notification;

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    let icon = null;
    let linkTo = '#';
    let iconColor = 'text-gray-500';

    switch (type) {
        case 'VIDEO_LIKE':
        case 'TWEET_LIKE':
        case 'COMMENT_LIKE':
            icon = <HiHeart />;
            iconColor = 'text-red-500';
            break;
        case 'NEW_VIDEO':
            icon = <HiVideoCamera />;
            iconColor = 'text-blue-500';
            break;
        case 'NEW_TWEET':
        case 'VIDEO_COMMENT':
            icon = <HiChatBubbleLeft />;
            iconColor = 'text-green-500';
            break;
        case 'NEW_SUBSCRIBER':
            icon = <HiUserPlus />;
            iconColor = 'text-purple-500';
            break;
        default:
            icon = <HiVideoCamera />;
    }

    // Determine link destination
    if (relatedVideo) linkTo = `/videos/${relatedVideo}`;
    else if (relatedTweet) linkTo = `/tweets/${relatedTweet}`; // Assuming tweet detail page exists or just tweets list
    else if (type === 'NEW_SUBSCRIBER' && sender) linkTo = `/users/${sender.username}`; // Assuming user profile page

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 ${
            isRead 
                ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800' 
                : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
        }`}>
            {/* Sender Avatar */}
            <div className="flex-shrink-0 relative">
                <img 
                    src={sender?.avatar || "https://via.placeholder.com/40"} 
                    alt={sender?.username || "User"} 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-white dark:bg-gray-800 ${iconColor} text-xs shadow-sm`}>
                    {icon}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <Link to={linkTo} className="block group">
                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                        <span className="font-semibold text-gray-900 dark:text-white mr-1">
                            {sender?.username || "Someone"}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {message}
                        </span>
                    </p>
                </Link>
                <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                    {formatDate(createdAt)}
                </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                {!isRead && (
                    <button 
                        onClick={() => onMarkRead(notification._id)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                        title="Mark as read"
                    >
                        <HiCheck size={16} />
                    </button>
                )}
                <button 
                    onClick={() => onDelete(notification._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Delete notification"
                >
                    <HiTrash size={16} />
                </button>
            </div>
        </div>
    );
}

export default NotificationItem;
