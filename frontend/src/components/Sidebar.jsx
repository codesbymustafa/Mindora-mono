import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineHome, AiOutlineLike } from "react-icons/ai";
import { BiVideo } from "react-icons/bi";
import { FiTwitter } from "react-icons/fi";
import { MdOutlineDashboard } from "react-icons/md";
import { HiOutlineCollection } from "react-icons/hi";

function Sidebar() {
    const location = useLocation()

    const navItems = [
        { name: 'Home', path: '/', icon: <AiOutlineHome /> },
        { name: 'Tweets', path: '/tweets', icon: <FiTwitter /> },
        { name: 'Videos', path: '/videos', icon: <BiVideo /> }, // Maybe same as home but filtered?
        { name: 'Liked Videos', path: '/liked-videos', icon: <AiOutlineLike /> },
        { name: 'Collections', path: '/collections', icon: <HiOutlineCollection /> },
        { name: 'Dashboard', path: '/dashboard', icon: <MdOutlineDashboard /> },
    ]

  return (
    <aside className="hidden w-64 flex-col border-r border-gray-700 bg-gray-900 md:flex min-h-[calc(100vh-4rem)]">
        <div className="flex flex-col gap-2 p-4">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:text-white hover:bg-gray-800 ${
                        location.pathname === item.path ? 'bg-gray-800 text-white' : ''
                    }`}
                >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                </Link>
            ))}
        </div>
    </aside>
  )
}

export default Sidebar
