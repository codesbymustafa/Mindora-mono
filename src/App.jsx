import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './components/AuthLayout'

import VideoDetail from './pages/VideoDetail'
import Dashboard from './pages/Dashboard'
import Collections from './pages/Collections'
import LikedVideos from './pages/LikedVideos'
import Notifications from './pages/Notifications'
import PlaylistDetail from './pages/PlaylistDetail'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <Routes>
                <Route path="/login" element={
                    <AuthLayout authentication={false}>
                        <Login />
                    </AuthLayout>
                } />
                <Route path="/register" element={
                    <AuthLayout authentication={false}>
                        <Register />
                    </AuthLayout>
                } />
                
                <Route path="/" element={
                    <AuthLayout authentication={true}>
                        <MainLayout />
                    </AuthLayout>
                }>
                    <Route index element={<Home />} />
                    <Route path="/videos" element={<Home />} />
                    <Route path="/tweets" element={<Home />} />
                    <Route path="/videos/:videoId" element={<VideoDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/playlist/:id" element={<PlaylistDetail />} />
                    <Route path="/liked-videos" element={<LikedVideos />} />
                    <Route path="/notifications" element={<Notifications />} />
                </Route>
            </Routes>
            <Toaster position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
