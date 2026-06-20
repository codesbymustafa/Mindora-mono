import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'
import VideoPlayer from '../components/VideoPlayer'
import VideoInfo from '../components/VideoInfo'
import CommentSection from '../components/CommentSection'
import RelatedVideos from '../components/RelatedVideos'

function VideoDetail() {
    const { videoId } = useParams()
    const { api, user } = useAuth()
    const [video, setVideo] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSubscribed, setIsSubscribed] = useState(false)

    const fetchComments = async () => {
        try {
            const commentsRes = await api.get(`/comments/${videoId}`)
            // Doc says: res.data.data.result is the array (paginated)

            // console.log(commentsRes.data);

            const commentsData = commentsRes.data.data.result

            // console.log(commentsData);

            if (Array.isArray(commentsData)) {
                const mappedComments = commentsData.map(comment => (
                    comment
                ))
                setComments(mappedComments)
            } else {
                console.error("Unexpected comments data format:", commentsRes.data)
                setComments([])
            }
        } catch (error) {
            console.error("Error fetching comments", error)
        }
    }

    useEffect(() => {
        const fetchVideoData = async () => {
            setLoading(true)
            let videoRes;
            try {
                videoRes = await api.get(`/videos/${videoId}`)
                // Doc says: res.data.data is the video object
                const videoData = videoRes?.data?.data || videoRes?.data?.message
                
                // console.log(videoData);

                // Fetc h like status
                let likeData = { totalLikes: videoData.likes, isLikedbyUser: videoData.isLikedByUser }

                if (videoData) {
                    setVideo({
                        ...videoData,
                        likesCount: likeData.totalLikes,
                        isLiked: likeData.isLikedbyUser
                    })
                    setIsSubscribed(videoData.isUserSubscribed || false)
                } else {
                    console.error("Unexpected video data format:", videoRes?.data)
                }
                
                await fetchComments()

                // Add to history
                try {
                    await api.patch(`/users/history/add/${videoId}`)
                } catch (err) {
                    console.error("Failed to add to history", err)
                }

                // Increment view count
                try {
                    await api.patch(`/videos/views/${videoId}`)
                } catch (err) {
                    console.error("Failed to increment views", err)
                }

            } catch (error) {
                console.error("Error fetching video details", error)
                toast.error("Failed to load video")
            } finally {
                setLoading(false)
            }
        }
        if (videoId && api) {
            fetchVideoData()
        }
    }, [videoId])

    const handleLikeVideo = async () => {
        try {
            const res = await api.post(`/like/v/${videoId}`)
            const { totalLikes, isLikedbyUser } = res.data.data
            setVideo(prev => ({
                ...prev,
                isLiked: isLikedbyUser,
                likesCount: totalLikes
            }))
        } catch (error) {
            console.error("Error liking video", error)
            toast.error("Failed to like video")
        }
    }

    const handleSubscribe = async () => {
        try {
            // video.owner is likely just the ID string based on API doc
            const channelId = typeof video.owner === 'object' ? video.owner._id : video.owner
            await api.post(`/subscriptions/c/${channelId}`)
            setIsSubscribed(!isSubscribed) // Optimistic toggle
            toast.success(isSubscribed ? "Unsubscribed" : "Subscribed")
        } catch (error) {
            console.error("Error subscribing", error)
            toast.error("Failed to subscribe")
        }
    }

    const handleAddComment = async (content) => {
        if (!content.trim()) return
        try {
            await api.post(`/comments/${videoId}`, { content })
            // Refetch comments as requested
            await fetchComments()
            toast.success("Comment added")
        } catch (error) {
            console.error("Error adding comment", error)
            toast.error("Failed to add comment")
        }
    }

    const handleLikeComment = async (commentId) => {
        try {
            const res = await api.post(`/like/c/${commentId}`)
            const { totalLikes, isLikedbyUser } = res.data.data
            setComments(prev => prev.map(c => {
                if (c._id === commentId) {
                    return {
                        ...c,
                        isLiked: isLikedbyUser,
                        likesCount: totalLikes
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
            await api.patch(`/comments/c/${commentId}`, { newContent }) 
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
    if (!video) return <div className="text-center mt-10 text-gray-600 dark:text-gray-400">Video not found</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <VideoPlayer video={video} onLike={handleLikeVideo} />
                <VideoInfo video={video} isSubscribed={isSubscribed} onSubscribe={handleSubscribe} />
                <CommentSection 
                    comments={comments} 
                    user={user} 
                    onAdd={handleAddComment} 
                    onLike={handleLikeComment} 
                    onDelete={handleDeleteComment} 
                    onEdit={handleEditComment} 
                />
            </div>
            <RelatedVideos />
        </div>
    </div>
  )
}

export default VideoDetail
