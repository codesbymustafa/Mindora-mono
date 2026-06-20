import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { HiHome, HiHandThumbUp, HiVideoCamera, HiChatBubbleLeftRight, HiSquares2X2, HiFolder, HiBell } from "react-icons/hi2";
import { useAuth } from '../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
    const location = useLocation()
    const { api, user } = useAuth()
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (!user) return;
        const ac = new AbortController();
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/notifications/unread-count')
                setUnreadCount(res.data.data.unreadCount)
            } catch (error) {
                console.error("Error fetching unread count", error)
            }
        }
        
        fetchUnreadCount();

        const interval = setInterval(fetchUnreadCount, 60000); // Refresh 
        
        return () => {
            ac.abort();
            clearInterval(interval)
        }
    }, [user?._id, api])

    const navItems = [
        { name: 'Home', path: '/', icon: <HiHome /> },
        { name: 'Liked Videos', path: '/liked-videos', icon: <HiHandThumbUp /> },
        { name: 'Collections', path: '/collections', icon: <HiFolder /> },
        { name: 'Notifications', path: '/notifications', icon: <HiBell />, badge: unreadCount },
        { name: 'Dashboard', path: '/dashboard', icon: <HiSquares2X2 /> },
    ]

  return (
    <>
        {/* Mobile overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                onClick={onClose}
            />
        )}
        
        {/* Sidebar */}
        <aside className={`
            fixed md:relative
            w-64 flex-col border-r border-gray-200 dark:border-gray-800 
            bg-white dark:bg-gray-900 
            min-h-[calc(100vh-4rem)] transition-all duration-300 z-50
            ${isOpen ? 'flex translate-x-0' : 'hidden md:flex'}
        `}>
            <div className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 transition-all hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 ${
                            location.pathname === item.path ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-white' : ''
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.name}</span>
                        </div>
                        {item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                {item.badge > 99 ? '99+' : item.badge}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </aside>
    </>
  )
}

export default Sidebar
