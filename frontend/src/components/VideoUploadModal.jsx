import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { HiXMark } from 'react-icons/hi2'
import Button from './Button'
import Input from './Input'

function VideoUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const { api } = useAuth()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        videoFile: null,
        thumbnail: null
    })
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        const { name, files } = e.target
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.title || !formData.description || !formData.videoFile) {
            toast.error('Please fill in all required fields')
            return
        }

        const data = new FormData()
        data.append('title', formData.title)
        data.append('description', formData.description)
        data.append('videoFile', formData.videoFile)
        if (formData.thumbnail) {
            data.append('thumbnail', formData.thumbnail)
        }

        setUploading(true)
        setUploadProgress(0)

        try {
            await api.post('/videos/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    setUploadProgress(progress)
                }
            })
            toast.success('Video uploaded successfully!')
            setFormData({ title: '', description: '', videoFile: null, thumbnail: null })
            if (onUploadSuccess) {
                onUploadSuccess()
            }
            onClose()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error(error.response?.data?.message || 'Failed to upload video')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Video</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <HiXMark size={24} className="text-gray-700 dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <Input
                        label="Title *"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter video title"
                        required
                    />

                    <div className="w-full">
                        <label className="inline-block mb-1 pl-1 text-gray-300">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter video description"
                            rows={4}
                            required
                            className="px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 border border-gray-700 focus:border-purple-500 w-full duration-200"
                        />
                    </div>

                    <div className="w-full">
                        <label className="inline-block mb-1 pl-1 text-gray-300">Video File *</label>
                        <input
                            type="file"
                            name="videoFile"
                            accept="video/*"
                            onChange={handleFileChange}
                            required
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 border border-gray-700 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                    </div>

                    <div className="w-full">
                        <label className="inline-block mb-1 pl-1 text-gray-300">Thumbnail (Optional)</label>
                        <input
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 border border-gray-700 focus:border-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">If not provided, a thumbnail will be generated from the video</p>
                    </div>

                    {uploading && (
                        <div className="w-full">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-300">Uploading...</span>
                                <span className="text-sm text-gray-300">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2"
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default VideoUploadModal
