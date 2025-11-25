import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { AiOutlineLike, AiFillLike, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";

function Comment({ comment, onLike, onDelete, onEdit, isOwner }) {
    const { user } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const handleSave = () => {
        onEdit(comment._id, editContent)
        setIsEditing(false)
    }

  return (
    <div className="flex gap-3 py-4 border-b border-gray-700 last:border-0">
        <div className="flex-shrink-0">
             <img 
                src={comment.owner?.avatar || "https://via.placeholder.com/40"} 
                alt={comment.owner?.username} 
                className="w-10 h-10 rounded-full object-cover"
            />
        </div>
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{comment.owner?.username}</span>
                    <span className="text-gray-400 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} className="text-gray-400 hover:text-white">
                            <AiOutlineEdit />
                        </button>
                        <button onClick={() => onDelete(comment._id)} className="text-gray-400 hover:text-red-500">
                            <AiOutlineDelete />
                        </button>
                    </div>
                )}
            </div>
            
            {isEditing ? (
                <div className="mt-2">
                    <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 focus:border-purple-500 outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white text-sm">Cancel</button>
                        <button onClick={handleSave} className="bg-purple-600 text-white px-3 py-1 rounded text-sm">Save</button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-200 mt-1 whitespace-pre-wrap">
                    {comment.content}
                </p>
            )}

            <div className="flex items-center gap-4 mt-2 text-gray-400">
                <button 
                    onClick={() => onLike(comment._id)}
                    className="flex items-center gap-1 hover:text-purple-500 transition-colors"
                >
                    {comment.isLiked ? <AiFillLike className="text-purple-500" /> : <AiOutlineLike />}
                    <span>{comment.likesCount || 0}</span>
                </button>
            </div>
        </div>
    </div>
  )
}

export default Comment
