import React from 'react'
import { HiHandThumbUp, HiOutlineHandThumbUp } from "react-icons/hi2";

function VideoPlayer({ video, onLike }) {
  if (!video) return null

  return (
    <div>
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <video 
                src={video.videoFile} 
                poster={video.thumbnail}
                controls 
                autoPlay 
                className="w-full h-full"
            />
        </div>
        
        <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{video.title}</h1>
            <div className="flex justify-between items-center mt-2 text-gray-600 dark:text-gray-400 text-sm">
                <span>{Array.isArray(video.views) ? video.views.length : (video.views || 0)} views • {new Date(video.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-4">
                    <button 
                        onClick={onLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${video.isLiked ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        {video.isLiked ? <HiHandThumbUp size={20} /> : <HiOutlineHandThumbUp size={20} />}
                        <span className="font-medium">{video.likesCount}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default VideoPlayer
