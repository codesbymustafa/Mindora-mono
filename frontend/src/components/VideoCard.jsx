import React from 'react'
import { Link } from 'react-router-dom'

function VideoCard({ video }) {
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
        </div>
        <div className="flex gap-3 mt-3">
            <div className="flex-shrink-0">
                <img 
                    src={video.owner?.avatar || "https://via.placeholder.com/40"} 
                    alt={video.owner?.username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
            </div>
            <div className="flex flex-col">
                <h3 className="text-white font-semibold line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {video.title}
                </h3>
                <span className="text-gray-400 text-sm mt-1">
                    {video.owner?.username}
                </span>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{formatDate(video.createdAt)}</span>
                </div>
            </div>
        </div>
    </Link>
  )
}

export default VideoCard
