import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'
import Loader from '../components/Loader'

function LikedVideos() {
    const { api } = useAuth()
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                const res = await api.get('/like/videos')
                // Doc says: res.data.data.likedVideos is the array
                const videosData = res.data.data?.likedVideos
                if (Array.isArray(videosData)) {
                    setVideos(videosData)
                } else {
                    setVideos([])
                }
            } catch (error) {
                console.error("Error fetching liked videos", error)
            } finally {
                setLoading(false)
            }
        }
        fetchLikedVideos()
    }, [api])

    if (loading) return <Loader />

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Liked Videos</h1>
            
            {videos.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    <p>No liked videos yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default LikedVideos
