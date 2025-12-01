import React from 'react'

function Spinner({ size = 'md', color = 'white' }) {
  const sizeClasses = {
    sm: 'w-3 h-3 border-2',
    md: 'w-4 h-4 border-2',
    lg: 'w-6 h-6 border-3',
  }

  const colorClasses = {
    white: 'border-white border-t-transparent',
    purple: 'border-purple-500 border-t-transparent',
    primary: 'border-primary-500 border-t-transparent',
  }

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}></div>
  )
}

export default Spinner
