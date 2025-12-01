import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { HiXMark } from 'react-icons/hi2'
import Button from './Button'
import Input from './Input'

function CreatePlaylistModal({ isOpen, onClose, onCreated }) {
    const { api } = useAuth()
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    })
    const [creating, setCreating] = useState(false)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.name || !formData.description) {
            toast.error('Please fill in all fields')
            return
        }

        setCreating(true)

        try {
            const res = await api.post('/playlist/', formData)
            toast.success('Playlist created successfully!')
            setFormData({ name: '', description: '' })
            onCreated(res.data.data)
            onClose()
        } catch (error) {
            console.error('Create playlist error:', error)
            toast.error(error.response?.data?.message || 'Failed to create playlist')
        } finally {
            setCreating(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Playlist</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <HiXMark size={24} className="text-gray-700 dark:text-white" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <Input
                        label="Playlist Name *"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter playlist name"
                        required
                    />

                    <div className="w-full">
                        <label className="inline-block mb-1 pl-1 text-gray-300">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter playlist description"
                            rows={3}
                            required
                            className="px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 border border-gray-700 focus:border-purple-500 w-full duration-200"
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2"
                            disabled={creating}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                            disabled={creating}
                        >
                            {creating ? 'Creating...' : 'Create Playlist'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePlaylistModal
