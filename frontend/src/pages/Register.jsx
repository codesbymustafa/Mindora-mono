import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import Spinner from '../components/Spinner'
import { toast } from 'react-hot-toast'

function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar: null
    })

    const handleChange = (e) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files[0] })
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!formData.avatar) {
            toast.error("Avatar is required")
            return
        }

        setLoading(true)
        const data = new FormData()
        data.append('username', formData.username)
        data.append('fullName', formData.fullName)
        data.append('email', formData.email)
        data.append('password', formData.password)
        data.append('avatar', formData.avatar)

        try {
            const success = await register(data)
            if (success) {
                navigate('/login')
            }
        } catch (error) {
            // Error already handled by register function
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-900 transition-colors duration-300">
        <div className={`mx-auto w-full max-w-lg bg-gray-800 rounded-xl p-10 border border-gray-700 shadow-xl`}>
            <div className="mb-2 flex justify-center">
                <span className="inline-block w-full max-w-[100px]">
                    <h1 className="text-3xl font-bold text-primary-500">Mindora</h1>
                </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-white">Sign up to create account</h2>
            <p className="mt-2 text-center text-base text-gray-400">
                Already have an account?&nbsp;
                <Link
                    to="/login"
                    className="font-medium text-primary-400 transition-all duration-200 hover:underline"
                >
                    Sign In
                </Link>
            </p>
            <form onSubmit={handleSubmit} className='mt-8'>
                <div className='space-y-5'>
                    <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                    />
                    <Input
                        label="Username"
                        placeholder="Enter your username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <Input
                        label="Email"
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
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Confirm your password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <Input
                        label="Avatar (Required)"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                    <Button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner />
                                Creating account...
                            </span>
                        ) : 'Create Account'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Register
