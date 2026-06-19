import React, { useId } from 'react';

const Input = React.forwardRef(function Input({
    label,
    type = "text",
    className = "",
    ...props
}, ref) {
    const id = useId();
    return (
        <div className='w-full'>
            {label && <label 
            className='inline-block mb-1 pl-1 text-gray-300' 
            htmlFor={id}>
                {label}
            </label>
            }
            <input
            type={type}
            className={`px-3 py-2 rounded-lg bg-gray-800 text-white outline-none focus:bg-gray-700 border border-gray-700 focus:border-purple-500 w-full duration-200 ${className}`}
            ref={ref}
            {...props}
            id={id}
            />
        </div>
    )
})

export default Input
