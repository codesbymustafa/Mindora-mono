import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { HiPlus, HiTrash, HiCamera } from "react-icons/hi2";
import Button from '../components/Button'
import Input from '../components/Input'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'
import defaultCover from '../assets/defaultCover.jpg'
import VideoUploadModal from '../components/VideoUploadModal'

function Dashboard() {
    const { api, user, updateCoverImage } = useAuth()
    const [stats, setStats] = useState(null)
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [uploadingCover, setUploadingCover] = useState(false)

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                const [statsRes, videosRes] = await Promise.all([
                    api.get('/dashboard/stats'),
                    api.get('/dashboard/videos')
                ])
                setStats(statsRes.data.data)
                const videosData = videosRes.data.data;
                setVideos(Array.isArray(videosData) ? videosData : [])
            } catch (error) {
                console.error("Error fetching dashboard data", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDashboardData()
    }, [api])

    const handleCoverImageChange = async (e) => {
        const file = e.target.files[0]
        if (file) {
            setUploadingCover(true)
            try {
                await updateCoverImage(file)
                toast.success('Cover image updated!')
            } catch (error) {
                console.error("Error updating cover image", error)
            } finally {
                setUploadingCover(false)
            }
        }
    }

    const handleVideoUploaded = async () => {
        // Refresh videos list after upload
        try {
            const videosRes = await api.get('/dashboard/videos')
            setVideos(videosRes.data.data || [])
        } catch (error) {
            console.error("Error refreshing videos", error)
        }
    }

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return
        try {
            await api.delete(`/videos/${videoId}`)
            setVideos(prev => prev.filter(v => v._id !== videoId))
            toast.success("Video deleted")
        } catch (error) {
            console.error("Error deleting video", error)
            toast.error("Failed to delete video")
        }
    }

    const handleTogglePublish = async (videoId) => {
        try {
            await api.patch(`/videos/toggle/publish/${videoId}`)
            setVideos(prev => prev.map(v => {
                if (v._id === videoId) {
                    return { ...v, isPublished: !v.isPublished }
                }
                return v
            }))
            toast.success("Video status updated")
        } catch (error) {
            console.error("Error toggling publish status", error)
            toast.error("Failed to update status")
        }
    }

    if (loading) return <Loader />

  return (
    <div className="max-w-6xl mx-auto">
        {/* Profile Header with Cover Image */}
        <div className="relative w-full h-48 sm:h-64 rounded-xl overflow-hidden mb-8 group">
            <img 
                src={user?.coverImage || defaultCover} 
                alt="Cover" 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {uploadingCover ? (
                    <div className="bg-black/70 text-white px-6 py-3 rounded-full flex items-center gap-2">
                        <Loader />
                        <span>Uploading...</span>
                    </div>
                ) : (
                    <label className="cursor-pointer bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-colors">
                        <HiCamera />
                        <span>Change Cover</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleCoverImageChange} />
                    </label>
                )}
            </div>
            <div className="absolute bottom-4 left-4 flex items-end gap-4">
                 <img 
                    src={user?.avatar || "https://via.placeholder.com/100"} 
                    alt={user?.username} 
                    className="w-24 h-24 rounded-full border-4 border-gray-900 object-cover"
                />
                <div className="mb-2">
                    <h1 className="text-2xl font-bold text-white shadow-black drop-shadow-md">{user?.fullName}</h1>
                    <p className="text-gray-200 shadow-black drop-shadow-md">@{user?.username}</p>
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Stats</h2>
            </div>
            <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
                <HiPlus /> Upload Video
            </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Views</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.totalViewsGotCount || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Subscribers</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.subscribersCount || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Videos</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats?.totalVideosCount || 0}</p>
            </div>
        </div>

        {/* Videos List */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Videos</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-3">Video</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {videos.map(video => (
                            <tr key={video._id} className="hover:bg-gray-100 dark:hover:bg-gray-700/50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={video.thumbnail} alt="" className="w-16 h-9 object-cover rounded" />
                                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{video.title}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleTogglePublish(video._id)}
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${video.isPublished ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-400'}`}
                                    >
                                        {video.isPublished ? 'Published' : 'Draft'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleDeleteVideo(video._id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <HiTrash size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {videos.length === 0 && (
                    <div className="p-8 text-center text-gray-400">
                        No videos uploaded yet
                    </div>
                )}
            </div>
        </div>

        <VideoUploadModal 
            isOpen={showUploadModal} 
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={handleVideoUploaded}
        />
    </div>
  )
}

export default Dashboard
