
import React, { useState } from 'react';
import Counter from '@/components/Counter';
import DataTable from '@/components/DataTable';

const Index = () => {
  const [currentCount, setCurrentCount] = useState(0);

  const handleCountChange = (count: number) => {
    setCurrentCount(count);
    console.log('Count updated in main page:', count);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex justify-center">
          <Counter onCountChange={handleCountChange} />
        </div>
        
        <div className="flex justify-center">
          <DataTable currentCount={currentCount} />
        </div>
      </div>
    </div>
  );
};

export default Index;
