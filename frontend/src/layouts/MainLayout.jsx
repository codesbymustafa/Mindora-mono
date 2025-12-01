import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

function MainLayout() {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header />
        <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-black/20">
                <Outlet />
            </main>
        </div>
    </div>
  )
}

export default MainLayout
