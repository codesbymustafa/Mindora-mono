import React from 'react'
import { Link } from 'react-router-dom'
import { AiOutlineLike, AiFillLike } from "react-icons/ai";

function TweetCard({ tweet, onLike }) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <div className="flex gap-3">
            <div className="flex-shrink-0">
                 <img 
                    src={tweet.owner?.avatar || "https://via.placeholder.com/40"} 
                    alt={tweet.owner?.username} 
                    className="w-10 h-10 rounded-full object-cover"
                />
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{tweet.owner?.username}</span>
                    <span className="text-gray-400 text-sm">
                        {new Date(tweet.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <p className="text-gray-200 mt-2 whitespace-pre-wrap">
                    {tweet.content}
                </p>
                <div className="flex items-center gap-4 mt-4 text-gray-400">
                    <button 
                        onClick={() => onLike(tweet._id)}
                        className="flex items-center gap-1 hover:text-purple-500 transition-colors"
                    >
                        {tweet.isLiked ? <AiFillLike className="text-purple-500" /> : <AiOutlineLike />}
                        <span>{tweet.likesCount || 0}</span>
                    </button>
                    {/* Add comment button etc if needed */}
                </div>
            </div>
        </div>
    </div>
  )
}

export default TweetCard
