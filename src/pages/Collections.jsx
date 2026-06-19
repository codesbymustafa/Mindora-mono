import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import { HiTrash, HiPlus } from "react-icons/hi2"
import { toast } from 'react-hot-toast'
import Button from '../components/Button'
import CreatePlaylistModal from '../components/CreatePlaylistModal'
import EditPlaylistModal from '../components/EditPlaylistModal'
import { HiPencil } from 'react-icons/hi2'

function Collections() {
    const { api, user } = useAuth()
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedPlaylist, setSelectedPlaylist] = useState(null)

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!user?._id) return;
            try {
                const res = await api.get(`/playlist/user/${user._id}`)
                // Doc says: res.data.data is the array
                const playlistData = res.data.data
                if (Array.isArray(playlistData)) {
                    setPlaylists(playlistData)
                } else {
                    setPlaylists([])
                }
            } catch (error) {
                console.error("Error fetching playlists", error)
                // toast.error("Failed to load collections") 
            } finally {
                setLoading(false)
            }
        }
        if (user) {
            fetchPlaylists()
        } else {
            setLoading(false)
        }
    }, [api, user])

    const handlePlaylistCreated = (newPlaylist) => {
        setPlaylists(prev => [newPlaylist, ...prev])
    }

    const handlePlaylistUpdated = (updatedPlaylist) => {
        setPlaylists(prev => prev.map(p => p._id === updatedPlaylist._id ? updatedPlaylist : p))
    }

    const handleEditClick = (e, playlist) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedPlaylist(playlist)
        setShowEditModal(true)
    }

    const handleDelete = async (id) => {
        if(!window.confirm("Delete this playlist?")) return;
        try {
            await api.delete(`/playlist/${id}`)
            setPlaylists(prev => prev.filter(p => p._id !== id))
            toast.success("Playlist deleted")
        } catch (error) {
            console.error("Error deleting playlist", error)
            toast.error("Failed to delete playlist")
        }
    }

    if (loading) return <Loader />

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your Collections</h1>
                <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                    <HiPlus size={20} />
                    Create Playlist
                </Button>
            </div>
            
            {playlists.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
                    <p>No collections found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map(playlist => (
                        <div key={playlist._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group relative">
                            <Link to={`/playlist/${playlist._id}`}>
                                <div className="h-40 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                    {playlist.thumbnail ? (
                                        <img src={playlist.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src="https://images.icon-icons.com/3251/PNG/512/video_clip_multiple_regular_icon_202661.png" alt="Playlist" className="w-20 h-20 opacity-50" />
                                    )}
                                </div>
                            </Link>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">{playlist.name}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{playlist.description}</p>
                                <p className="text-xs text-gray-400 mt-3">{playlist.videos?.length || 0} videos</p>
                            </div>
                            <button 
                                onClick={(e) => handleEditClick(e, playlist)}
                                className="absolute top-2 left-2 p-2 bg-purple-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
                            >
                                <HiPencil />
                            </button>
                            <button 
                                onClick={() => handleDelete(playlist._id)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <HiTrash />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <CreatePlaylistModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
                onCreated={handlePlaylistCreated}
            />
            <EditPlaylistModal 
                isOpen={showEditModal} 
                onClose={() => setShowEditModal(false)} 
                playlist={selectedPlaylist}
                onUpdated={handlePlaylistUpdated}
            />
        </div>
    )
}

export default Collections
