import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'
import { HiPlay, HiPencil } from 'react-icons/hi2'
import EditPlaylistModal from '../components/EditPlaylistModal'

function PlaylistDetail() {
    const { id } = useParams()
    const { api } = useAuth()
    const [playlist, setPlaylist] = useState(null)
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)

    useEffect(() => {
        const fetchPlaylist = async () => {
            setLoading(true)
            try {
                const res = await api.get(`/playlist/${id}`)
                const data = res.data.data
                setPlaylist(data.playlistData || data)
                setVideos(data.videos || [])
            } catch (error) {
                console.error('Error fetching playlist:', error)
                toast.error('Failed to load playlist')
            } finally {
                setLoading(false)
            }
        }
        if (id) {
            fetchPlaylist()
        }
    }, [id, api])

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = Math.floor(seconds % 60)
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`
    }

    const handlePlaylistUpdated = (updatedPlaylist) => {
        setPlaylist(updatedPlaylist)
    }

    if (loading) return <Loader />
    if (!playlist) return <div className="text-center mt-10 text-gray-600 dark:text-gray-400">Playlist not found</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Playlist Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 mb-8 text-white">
                <div className="flex items-center gap-6">
                    <div className="w-40 h-40 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        {playlist.thumbnail ? (
                            <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <img src="https://images.icon-icons.com/3251/PNG/512/video_clip_multiple_regular_icon_202661.png" alt="Playlist" className="w-20 h-20 opacity-70" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium opacity-90 mb-2">PLAYLIST</p>
                        <h1 className="text-4xl font-bold mb-3">{playlist.name}</h1>
                        <p className="text-white/80 mb-4">{playlist.description}</p>
                        <div className="flex items-center gap-4">
                            <p className="text-sm">
                                {videos.length} video{videos.length !== 1 ? 's' : ''}
                            </p>
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                            >
                                <HiPencil size={16} />
                                <span className="text-sm font-medium">Edit</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos List */}
            <div className="space-y-3">
                {videos.length === 0 ? (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                        <p>No videos in this playlist yet</p>
                    </div>
                ) : (
                    videos.map((video, index) => (
                        <Link
                            key={video._id}
                            to={`/videos/${video._id}`}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        >
                            <span className="text-gray-500 dark:text-gray-400 font-medium w-6 text-center">
                                {index + 1}
                            </span>
                            <div className="relative flex-shrink-0">
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-32 h-20 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                    <HiPlay className="text-white" size={28} />
                                </div>
                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {formatDuration(video.duration)}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(video.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
            <EditPlaylistModal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)} 
                playlist={playlist}
                onUpdated={handlePlaylistUpdated}
            />
        </div>
    )
}

export default PlaylistDetail
