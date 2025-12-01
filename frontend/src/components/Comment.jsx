import React, { useState } from 'react'
import { HiHandThumbUp, HiOutlineHandThumbUp, HiTrash, HiPencil } from "react-icons/hi2";
import useFetchUser from '../hooks/useFetchUser';

function  Comment({ comment, onLike, onDelete, onEdit, isOwner }) {
    const { userData: owner } = useFetchUser(comment.owner);
    const [isEditing, setIsEditing] = useState(false)
    const [editContent, setEditContent] = useState(comment.content)

    const handleSave = () => {
        onEdit(comment._id, editContent)
        setIsEditing(false)
    }

  return (
    <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <img 
            src={owner?.avatar || "https://avatar.iran.liara.run/public"} 
            alt={owner?.username} 
            className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{owner?.username || "Unknown User"}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                        {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(!isEditing)} className="text-gray-500 hover:text-primary-500">
                            <HiPencil size={16} />
                        </button>
                        <button onClick={() => onDelete(comment._id)} className="text-gray-500 hover:text-red-500">
                            <HiTrash size={16} />
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div className="mt-2">
                    <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded border border-gray-300 dark:border-gray-700 focus:border-primary-500 outline-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-white text-sm">Cancel</button>
                        <button onClick={handleSave} className="bg-primary-600 text-white px-3 py-1 rounded text-sm">Save</button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700 dark:text-gray-200 mt-1 whitespace-pre-wrap text-sm">
                    {comment.content}
                </p>
            )}

            <div className="flex items-center gap-4 mt-2">
                <button 
                    onClick={() => onLike(comment._id)}
                    className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors text-sm"
                >
                    {comment.isLikedByUser ? <HiHandThumbUp className="text-primary-500" /> : <HiOutlineHandThumbUp />}
                    <span>{comment.likes || 0}</span>
                </button>
            </div>
        </div>
    </div>
  )
}

export default Comment
