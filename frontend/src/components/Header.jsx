import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './Button'
import { IoSearchOutline } from "react-icons/io5";

function Header() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0 mx-auto px-4">
            <div className="flex gap-6 md:gap-10">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="inline-block font-bold text-xl text-purple-500">Mindora</span>
                </Link>
            </div>
            <div className="flex flex-1 items-center justify-end space-x-4">
                <div className='w-full max-w-md mr-4 hidden md:block'>
                   <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Search" 
                            className="w-full bg-gray-800 text-white border border-gray-700 rounded-full py-2 px-4 pl-10 focus:outline-none focus:border-purple-500"
                        />
                        <IoSearchOutline className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                   </div>
                </div>
                <nav className="flex items-center space-x-2">
                    {user ? (
                        <>
                            <span className="text-sm text-gray-300 mr-2 hidden sm:inline-block">Hello, {user.username}</span>
                            <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-sm py-1 px-3">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button className="bg-transparent hover:bg-gray-800 text-white border border-gray-700 text-sm py-1 px-3">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button className="text-sm py-1 px-3">
                                    Sign Up
                                </Button>
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </div>
    </header>
  )
}

export default Header
