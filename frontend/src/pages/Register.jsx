import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import { toast } from 'react-hot-toast'

function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()
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

        const data = new FormData()
        data.append('username', formData.username)
        data.append('fullName', formData.fullName)
        data.append('email', formData.email)
        data.append('password', formData.password)
        if (formData.avatar) data.append('avatar', formData.avatar)

        const success = await register(data)
        if (success) {
            navigate('/login')
        }
    }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-gray-900">
        <div className={`mx-auto w-full max-w-lg bg-gray-800 rounded-xl p-10 border border-gray-700`}>
            <div className="mb-2 flex justify-center">
                <span className="inline-block w-full max-w-[100px]">
                    <h1 className="text-3xl font-bold text-purple-500">Mindora</h1>
                </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-white">Sign up to create account</h2>
            <p className="mt-2 text-center text-base text-gray-400">
                Already have an account?&nbsp;
                <Link
                    to="/login"
                    className="font-medium text-purple-400 transition-all duration-200 hover:underline"
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
                        label="Avatar"
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    <Button type="submit" className="w-full">
                        Create Account
                    </Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Register
