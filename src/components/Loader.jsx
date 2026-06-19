import React from 'react'

function Loader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

export default Loader
