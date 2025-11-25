import Loader from './Loader'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AuthLayout({ children, authentication = true }) {
    const navigate = useNavigate()
    const { user, loading } = useAuth()
    const [loader, setLoader] = useState(true)

    useEffect(() => {
        if(!loading) {
            if (authentication && !user) {
                navigate("/login")
            } else if (!authentication && user) {
                navigate("/")
            }
            setLoader(false)
        }
    }, [loading, user, navigate, authentication])

  return loader ? <Loader /> : <>{children}</>
}
