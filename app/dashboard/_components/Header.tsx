import { Search } from 'lucide-react'
import React from 'react'

function Header() {
  return (
    <div className='p-5 shadow-sm border-b-2 bg-white flex justify-between items-center'>
        <div className='flex gap-2 items-center p-2 border rounded-md max-w-md bg-white'>
            <Search/>
            <input type='text' placeholder='Search..' className='outline-none'></input>
        </div>
        <div>
            <h2 className='bg-primary P-1 rounded-full text-xs text-white px-2'>
                Subscribe for $9.99/month
            </h2>
        </div>
    </div>
  ) 
}

export default Header