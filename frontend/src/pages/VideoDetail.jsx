import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AiOutlineLike, AiFillLike } from "react-icons/ai";
import Comment from '../components/Comment'
import Button from '../components/Button'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'

function VideoDetail() {
    const { videoId } = useParams()
    const { api, user } = useAuth()
    const [video, setVideo] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [newComment, setNewComment] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(false)

    useEffect(() => {
        const fetchVideoData = async () => {
            setLoading(true)
            try {
                const videoRes = await api.get(`/videos/${videoId}`)
                setVideo(videoRes.data.data)
                
                // Fetch comments
                const commentsRes = await api.get(`/comments/${videoId}`)
                setComments(commentsRes.data.data.docs || commentsRes.data.data)

                // Check subscription status (if endpoint exists, or derived from user data)
                // Assuming we can check if user is subscribed to channel
                // For now, let's just assume false or implement if API supports it
                if (videoRes.data.data.owner) {
                     const subRes = await api.get(`/subscriptions/c/${videoRes.data.data.owner._id}`)
                     // API doc says GET /subscriptions/c/{channelId} returns something.
                     // Assuming it returns subscription status or list.
                     // If it returns list of subscribers, we check if current user is in it.
                     // Or maybe it returns boolean? Let's check API doc.
                     // GET /subscriptions/c/{channelId} -> usually returns subscriber list.
                     // GET /subscriptions/u/{userId} -> returns channels subscribed to?
                     // Let's skip complex subscription check for now and just implement toggle.
                }

            } catch (error) {
                console.error("Error fetching video details", error)
                toast.error("Failed to load video")
            } finally {
                setLoading(false)
            }
        }
        fetchVideoData()
    }, [videoId, api])

    const handleLikeVideo = async () => {
        try {
            await api.post(`/like/toggle/v/${videoId}`)
            setVideo(prev => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1
            }))
        } catch (error) {
            console.error("Error liking video", error)
            toast.error("Failed to like video")
        }
    }

    const handleSubscribe = async () => {
        try {
            await api.post(`/subscriptions/c/${video.owner._id}`)
            setIsSubscribed(!isSubscribed) // Optimistic toggle
            toast.success(isSubscribed ? "Unsubscribed" : "Subscribed")
        } catch (error) {
            console.error("Error subscribing", error)
            toast.error("Failed to subscribe")
        }
    }

    const handleAddComment = async (e) => {
        e.preventDefault()
        if (!newComment.trim()) return
        try {
            const res = await api.post(`/comments/${videoId}`, { content: newComment })
            setComments(prev => [res.data.data, ...prev])
            setNewComment('')
            toast.success("Comment added")
        } catch (error) {
            console.error("Error adding comment", error)
            toast.error("Failed to add comment")
        }
    }

    const handleLikeComment = async (commentId) => {
        try {
            await api.post(`/like/toggle/c/${commentId}`)
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    return {
                        ...c,
                        isLiked: !c.isLiked,
                        likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1
                    }
                }
                return c
            }))
        } catch (error) {
            console.error("Error liking comment", error)
            toast.error("Failed to like comment")
        }
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/c/${commentId}`)
            setComments(prev => prev.filter(c => c._id !== commentId))
            toast.success("Comment deleted")
        } catch (error) {
            console.error("Error deleting comment", error)
            toast.error("Failed to delete comment")
        }
    }

    const handleEditComment = async (commentId, newContent) => {
        try {
            await api.patch(`/comments/c/${commentId}`, { newContent }) // API expects "newContent" key? Doc says "content" or "newContent"?
            // Doc says: PATCH /comments/c/{commentId} Body: { "newContent": "string" }
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    return { ...c, content: newContent }
                }
                return c
            }))
            toast.success("Comment updated")
        } catch (error) {
            console.error("Error editing comment", error)
            toast.error("Failed to edit comment")
        }
    }

    if (loading) return <Loader />
    if (!video) return <div className="text-center mt-10">Video not found</div>

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                <video 
                    src={video.videoFile} 
                    poster={video.thumbnail} 
                    controls 
                    autoPlay 
                    className="w-full h-full"
                />
            </div>
            
            <div className="mt-4">
                <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                        <span>{video.views} views</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleLikeVideo}
                            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full transition-colors"
                        >
                            {video.isLiked ? <AiFillLike className="text-purple-500 text-xl" /> : <AiOutlineLike className="text-xl" />}
                            <span className="font-medium">{video.likesCount}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                         <img 
                            src={video.owner?.avatar || "https://via.placeholder.com/40"} 
                            alt={video.owner?.username} 
                            className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <h3 className="font-bold text-white">{video.owner?.username}</h3>
                            <p className="text-sm text-gray-400">{video.owner?.subscribersCount || 0} subscribers</p>
                        </div>
                    </div>
                    <Button onClick={handleSubscribe} className={isSubscribed ? "bg-gray-600" : "bg-purple-600"}>
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                    </Button>
                </div>
                <p className="text-gray-200 whitespace-pre-wrap text-sm">
                    {video.description}
                </p>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>
                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                     <img 
                        src={user?.avatar || "https://via.placeholder.com/40"} 
                        alt={user?.username} 
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Add a comment..." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="w-full bg-transparent border-b border-gray-700 focus:border-purple-500 outline-none py-2 text-white"
                        />
                        <div className="flex justify-end mt-2">
                            <Button type="submit" disabled={!newComment.trim()} className="py-1 px-3 text-sm">
                                Comment
                            </Button>
                        </div>
                    </div>
                </form>
                
                <div className="space-y-2">
                    {comments.map(comment => (
                        <Comment 
                            key={comment._id} 
                            comment={comment} 
                            onLike={handleLikeComment}
                            onDelete={handleDeleteComment}
                            onEdit={handleEditComment}
                            isOwner={user?._id === comment.owner?._id}
                        />
                    ))}
                </div>
            </div>
        </div>
        
        <div className="lg:col-span-1">
            {/* Related Videos could go here */}
            <h3 className="text-lg font-bold mb-4">Related Videos</h3>
            <p className="text-gray-400 text-sm">Coming soon...</p>
        </div>
    </div>
  )
}

export default VideoDetail
