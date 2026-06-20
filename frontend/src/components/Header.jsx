import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiMagnifyingGlass, HiVideoCamera, HiBell, HiBars3, HiSun, HiMoon } from "react-icons/hi2";
import Button from './Button'
import VideoUploadModal from './VideoUploadModal'

function Header({ toggleSidebar }) {
    const { user, logout, theme, toggleTheme } = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showUploadModal, setShowUploadModal] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        // Implement search functionality
        console.log("Searching for:", searchQuery)
    }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-white lg:hidden">
                    <HiBars3 size={24} />
                </button>
                <Link to="/" className="flex items-center gap-1">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                         <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Mindora</span>
                </Link>
            </div>

            <div className="flex-1 max-w-2xl mx-4 hidden sm:block">
                <form onSubmit={handleSearch} className="flex items-center">
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-l-full px-4 py-2 text-gray-900 dark:text-white focus:border-primary-500 outline-none transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="bg-gray-200 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-full px-5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
                        <HiMagnifyingGlass size={22} />
                    </button>
                </form>
            </div>

            <div className="flex items-center gap-3">
                <button onClick={handleSearch} className="sm:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-white">
                    <HiMagnifyingGlass size={24} />
                </button>

                <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-white transition-colors">
                    {theme === 'dark' ? <HiSun size={24} /> : <HiMoon size={24} />}
                </button>

                {user ? (
                    <>
                        <button onClick={() => setShowUploadModal(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-white">
                            <HiVideoCamera size={24} />
                        </button>
                        <button onClick={() => navigate('/notifications')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-700 dark:text-white">
                            <HiBell size={24} />
                        </button>
                        <div className="relative group h-full flex items-center">
                            <button className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 dark:border-gray-700 focus:outline-none">
                                <img src={user.avatar || "https://via.placeholder.com/40"} alt="User" className="w-full h-full object-cover" />
                            </button>
                            {/* Dropdown with transparent bridge */}
                            <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{user.username}</p>
                                    </div>
                                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Dashboard</Link>
                                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">Sign Out</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <Link to="/login">
                            <Button className="bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-1.5">
                                Log in
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5">
                                Sign up
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
        <VideoUploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} />
    </header>
  )
}

export default Header
