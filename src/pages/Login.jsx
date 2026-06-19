import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Input from '../components/Input'
import Button from '../components/Button'
import Spinner from '../components/Spinner'
import { toast } from 'react-hot-toast'

function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        
        // Determine if identifier is email or username
        const isEmail = identifier.includes('@')
        const payload = {
            password,
            ...(isEmail ? { email: identifier } : { username: identifier })
        }

        try {
            await login(payload)
            navigate('/')
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid credentials"
            setError(msg)
            toast.error(msg)
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className='flex items-center justify-center w-full min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300'>
        <div className={`mx-auto w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl p-10 border border-gray-200 dark:border-gray-700 shadow-xl`}>
            <div className="mb-2 flex justify-center">
                <span className="inline-block w-full max-w-[100px]">
                    <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-500">Mindora</h1>
                </span>
            </div>
            <h2 className="text-center text-2xl font-bold leading-tight text-gray-900 dark:text-white">Sign in to your account</h2>
            <p className="mt-2 text-center text-base text-gray-600 dark:text-gray-400">
                Don&apos;t have any account?&nbsp;
                <Link
                    to="/register"
                    className="font-medium text-primary-600 dark:text-primary-400 transition-all duration-200 hover:underline"
                >
                    Sign Up
                </Link>
            </p>
            
            <form onSubmit={handleSubmit} className='mt-8'>
                <div className='space-y-5'>
                    <Input
                        label="Username or Email"
                        placeholder="Enter your username or email"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                    />
                    <div>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    
                    <Button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Spinner />
                                Signing in...
                            </span>
                        ) : 'Sign in'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login
