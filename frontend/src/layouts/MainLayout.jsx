import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Header />
        <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-4rem)]">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default MainLayout
