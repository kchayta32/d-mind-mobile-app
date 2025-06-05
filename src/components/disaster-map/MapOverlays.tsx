
import React from 'react';
import { DisasterType } from './DisasterMap';

interface MapOverlaysProps {
  selectedType: DisasterType;
  isLoading: boolean;
}

export const MapOverlays: React.FC<MapOverlaysProps> = ({ selectedType, isLoading }) => {
  const renderComingSoon = () => {
    if (selectedType === 'flood' || selectedType === 'storm') {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2">🚧 เร็วๆ นี้</h3>
            <p className="text-gray-600">
              แผนที่{selectedType === 'flood' ? 'น้ำท่วม' : 'พายุ'}
              จะเปิดให้บริการเร็วๆ นี้
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLoading = () => {
    if (!isLoading) return null;
    
    return (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-[1000]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderComingSoon()}
      {renderLoading()}
    </>
  );
};
