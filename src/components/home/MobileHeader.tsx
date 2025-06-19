
import React from 'react';

const MobileHeader: React.FC = () => {
  return (
    <header className="bg-white shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-6 w-6"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">D-MIND</h1>
              <p className="text-xs text-gray-500 font-medium">Disaster Monitoring System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">ออนไลน์</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
