import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({
        username: '', // API accepts username or email in 'username' field usually, or separate. API doc says username, email, password.
        // Wait, API doc for login says body: { username, email, password }. Usually login is username OR email.
        // Let's assume username for now based on typical flows or check API doc again.
        // API Doc: POST /users/login Body: { "username": "string", "email": "string", "password": "string" }
        // It seems it might accept either. I'll send both if user enters email/username in one field?
        // Or maybe I should just ask for username and password.
        // Let's stick to username and password for simplicity, or email.
        email: '',
        password: ''
    })

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // Construct payload. If user entered email in username field, handle that?
        // For now, I'll just provide fields for username and password.
        // If API requires email, I might need to ask for it.
        // Let's assume username is enough if email is empty, or vice versa.
        const success = await login(formData)
        if (success) {
            navigate('/')
        }
    }

  return (
    <div className='flex items-center justify-center w-full min-h-screen bg-gray-900'>
        <div className={`mx-auto w-full max-w-lg bg-gray-800 rounded-xl p-10 border border-gray-700`}>
            <div className="mb-2 flex justify-center">
                <span className="inline-block w-full max-w-[100px]">
                    {/* Logo placeholder */}
                    <h1 className="text-3xl font-bold text-purple-500">Mindora</h1>
                </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-white">Sign in to your account</h2>
            <p className="mt-2 text-center text-base text-gray-400">
                Don&apos;t have any account?&nbsp;
                <Link
                    to="/register"
                    className="font-medium text-purple-400 transition-all duration-200 hover:underline"
                >
                    Sign Up
                </Link>
            </p>
            <form onSubmit={handleSubmit} className='mt-8'>
                <div className='space-y-5'>
                    <Input
                        label="Username"
                        placeholder="Enter your username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email" // Optional if API allows login with just username
                        placeholder="Enter your email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <Button
                        type="submit"
                        className="w-full"
                    >
                        Sign in
                    </Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login
