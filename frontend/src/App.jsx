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

function App() {
  return (
    <Router future={{ v7_startTransition: true }}>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-white font-sans">
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
                    <Route path="/videos/:videoId" element={<VideoDetail />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Route>
            </Routes>
            <Toaster position="bottom-right" />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
