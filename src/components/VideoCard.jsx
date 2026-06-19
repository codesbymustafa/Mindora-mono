import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useFetchUser from '../hooks/useFetchUser'
import { HiEllipsisVertical } from 'react-icons/hi2'
import AddToPlaylistModal from './AddToPlaylistModal'

function VideoCard({ video }) {
    const { userData: owner } = useFetchUser(video.owner);
    const [showMenu, setShowMenu] = useState(false)
    const [showPlaylistModal, setShowPlaylistModal] = useState(false)

    // Helper to format duration
    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    // Helper to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Or use a library like date-fns
    };

  return (
    <Link to={`/videos/${video._id}`} className="block group">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800">
            <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
            </span>
            <button
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMenu(!showMenu)
                }}
                className="absolute top-2 right-2 p-2 bg-black/80 hover:bg-black rounded-full transition-colors"
            >
                <HiEllipsisVertical size={20} className="text-white" />
            </button>
            {showMenu && (
                <div className="absolute top-12 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowPlaylistModal(true)
                            setShowMenu(false)
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Add to collection
                    </button>
                </div>
            )}
        </div>
        <div className="flex gap-3 mt-3">
            <div className="flex-shrink-0">
                <img 
                    src={owner?.avatar || "https://via.placeholder.com/40"} 
                    alt={owner?.username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
            </div>
            <div className="flex flex-col">
                <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {video.title}
                </h3>
                <span className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {owner?.username || "Unknown User"}
                </span>
                <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                    <span>{Array.isArray(video.views) ? video.views.length : (video.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.createdAt)}</span>
                </div>
            </div>
        </div>
        <AddToPlaylistModal 
            isOpen={showPlaylistModal} 
            onClose={() => setShowPlaylistModal(false)} 
            videoId={video._id}
        />
    </Link>
  )
}

export default VideoCard
