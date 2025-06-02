import { useState } from 'react'
import { Button } from '@/components/ui/button'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Welcome to Our App! 🎉
        </h1>
        
        <div className="mb-6">
          <p className="text-lg text-gray-600 mb-4">
            You have clicked the button{' '}
            <span className="font-bold text-indigo-600">{count}</span>{' '}
            {count === 1 ? 'time' : 'times'}!
          </p>
        </div>

        <Button 
          onClick={() => setCount(count + 1)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 ease-in-out transform hover:scale-105"
          size="lg"
        >
          Click Me! 🚀
        </Button>

        <p className="text-sm text-gray-500 mt-6">
          Built with React, TypeScript, and shadcn/ui
        </p>
      </div>
    </div>
  )
}

export default App
