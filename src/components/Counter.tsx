
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CounterProps {
  onCountChange: (count: number) => void;
}

const Counter: React.FC<CounterProps> = ({ onCountChange }) => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    onCountChange(newCount);
    console.log('Counter incremented to:', newCount);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-8 bg-white border-2 border-black">
      <div className="text-6xl font-bold text-black">{count}</div>
      <Button 
        onClick={handleIncrement}
        className="bg-black text-white hover:bg-gray-800 border-2 border-black px-8 py-4"
        size="lg"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Counter;
