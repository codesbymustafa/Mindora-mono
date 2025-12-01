import React from 'react'
import Button from './Button'
import useFetchUser from '../hooks/useFetchUser'

function VideoInfo({ video, isSubscribed, onSubscribe }) {
  const { userData: owner } = useFetchUser(video?.owner);

  if (!video) return null

  return (
    <div className="mt-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <img 
                    src={owner?.avatar || "https://via.placeholder.com/40"} 
                    alt={owner?.username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{owner?.fullName || "Unknown User"}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">@{owner?.username}</p>
                </div>
            </div>
            <Button 
                onClick={onSubscribe}
                className={isSubscribed ? "bg-gray-500 hover:bg-gray-600" : ""}
            >
                {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{video.description}</p>
    </div>
  )
}

export default VideoInfo
