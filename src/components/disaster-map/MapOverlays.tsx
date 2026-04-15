
import React from 'react';
import { DisasterType } from './types';

interface MapOverlaysProps {
  selectedType: DisasterType;
  isLoading: boolean;
}

export const MapOverlays: React.FC<MapOverlaysProps> = ({ selectedType, isLoading }) => {
  const renderComingSoon = () => {
    if (selectedType === 'storm') {
      return (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
            <h3 className="text-xl font-bold mb-2 dark:text-gray-100">🚧 เร็วๆ นี้</h3>
            <p className="text-gray-600 dark:text-gray-400">
              แผนที่พายุจะเปิดให้บริการเร็วๆ นี้
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
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-[1000]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">กำลังโหลดข้อมูล...</p>
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
