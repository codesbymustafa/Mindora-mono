import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { HiXMark } from 'react-icons/hi2'
import Button from './Button'
import Loader from './Loader'

function AddToPlaylistModal({ isOpen, onClose, videoId }) {
    const { api, user } = useAuth()
    const [playlists, setPlaylists] = useState([])
    const [selectedPlaylists, setSelectedPlaylists] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (isOpen && user) {
            fetchPlaylists()
        }
    }, [isOpen, user])

    const fetchPlaylists = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/playlist/user/${user._id}`)
            setPlaylists(res.data.data || [])
        } catch (error) {
            console.error('Error fetching playlists:', error)
            toast.error('Failed to load playlists')
        } finally {
            setLoading(false)
        }
    }

    const togglePlaylist = (playlistId) => {
        setSelectedPlaylists(prev => {
            const newSet = new Set(prev)
            if (newSet.has(playlistId)) {
                newSet.delete(playlistId)
            } else {
                newSet.add(playlistId)
            }
            return newSet
        })
    }

    const handleSubmit = async () => {
        if (selectedPlaylists.size === 0) {
            toast.error('Please select at least one playlist')
            return
        }

        setAdding(true)
        let successCount = 0
        let errorCount = 0

        for (const playlistId of selectedPlaylists) {
            try {
                await api.patch(`/playlist/add/${videoId}/${playlistId}`)
                successCount++
            } catch (error) {
                console.error(`Error adding to playlist ${playlistId}:`, error)
                errorCount++
            }
        }

        if (successCount > 0) {
            toast.success(`Added to ${successCount} playlist${successCount > 1 ? 's' : ''}`)
        }
        if (errorCount > 0) {
            toast.error(`Failed to add to ${errorCount} playlist${errorCount > 1 ? 's' : ''}`)
        }

        setSelectedPlaylists(new Set())
        setAdding(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add to Collection</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <HiXMark size={24} className="text-gray-700 dark:text-white" />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader />
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            <p>No playlists found. Create one first!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {playlists.map(playlist => (
                                <label
                                    key={playlist._id}
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPlaylists.has(playlist._id)}
                                        onChange={() => togglePlaylist(playlist._id)}
                                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500 dark:ring-offset-gray-800"
                                    />
                                    <div className="ml-3 flex-1">
                                        <p className="text-gray-900 dark:text-white font-medium">{playlist.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{playlist.videos?.length || 0} videos</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        onClick={onClose}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2"
                        disabled={adding}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                        disabled={adding || playlists.length === 0}
                    >
                        {adding ? 'Adding...' : 'Add to Playlist'}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AddToPlaylistModal
