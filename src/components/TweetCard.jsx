import React from 'react'
import { Link } from 'react-router-dom'
import { HiHandThumbUp, HiOutlineHandThumbUp } from "react-icons/hi2";
import useFetchUser from '../hooks/useFetchUser';

function TweetCard({ tweet, onLike }) {
    const { userData: owner } = useFetchUser(tweet.owner);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                 <img 
                    src={owner?.avatar || "https://via.placeholder.com/40"} 
                    alt={owner?.username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{owner?.username || "Unknown User"}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {new Date(tweet.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-gray-700 dark:text-gray-200 mt-2 whitespace-pre-wrap">
                    {tweet.content}
                </p>
                <div className="flex items-center gap-4 mt-4 text-gray-500 dark:text-gray-400">
                    <button 
                        onClick={() => onLike(tweet._id)}
                        className="flex items-center gap-1 hover:text-primary-500 transition-colors"
                    >
                        {tweet.isLiked ? <HiHandThumbUp className="text-primary-500" /> : <HiOutlineHandThumbUp />}
                        <span>{tweet.likesCount || 0}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default TweetCard
