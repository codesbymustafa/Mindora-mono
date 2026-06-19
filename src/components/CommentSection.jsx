import React, { useState } from 'react'
import Button from './Button'
import Comment from './Comment'

function CommentSection({ comments, user, onAdd, onLike, onDelete, onEdit }) {
    const [newComment, setNewComment] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        onAdd(newComment)
        setNewComment('')
    }

  return (
    <div className="mt-8">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{comments.length} Comments</h3>
        
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
            <img 
                src={user?.avatar || "https://via.placeholder.com/40"} 
                alt="User" 
                className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
                <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:border-primary-500 dark:focus:border-primary-500 outline-none py-2 text-gray-900 dark:text-white transition-colors"
                />
                <div className="flex justify-end mt-2">
                    <Button type="submit" disabled={!newComment.trim()} className="py-1 px-4 rounded-full text-sm">
                        Comment
                    </Button>
                </div>
            </div>
        </form>

        <div className="space-y-4">
            {comments.map(comment => (
                <Comment 
                    key={comment._id} 
                    comment={comment} 
                    onLike={onLike}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    isOwner={user?._id === comment.owner?._id}
                />
            ))}
        </div>
    </div>
  )
}

export default CommentSection
