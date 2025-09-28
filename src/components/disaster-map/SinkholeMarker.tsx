import React, { useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mountain, Calendar, MapPin, AlertTriangle, Images } from 'lucide-react';
import L from 'leaflet';

interface SinkholeData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  location: string;
  date: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  mainImage: string;
  additionalImages: string[];
  estimatedSize: string;
  cause: string;
  status: string;
}

interface SinkholeMarkerProps {
  sinkhole: SinkholeData;
}

// Custom icon for sinkhole markers
const sinkholeIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #D97706, #F59E0B);
      border: 3px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
        <path d="M5 21h14l-7-12L5 21z"/>
        <circle cx="12" cy="17" r="1"/>
        <path d="M12 13v2"/>
      </svg>
      <div style="
        position: absolute;
        top: -8px;
        right: -8px;
        background: #EF4444;
        border: 2px solid white;
        border-radius: 50%;
        width: 12px;
        height: 12px;
      "></div>
    </div>
  `,
  className: 'sinkhole-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const SinkholeMarker: React.FC<SinkholeMarkerProps> = ({ sinkhole }) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Handle body scroll and focus management
  React.useEffect(() => {
    if (showImageDialog) {
      document.body.style.overflow = 'hidden';
      // Focus management would go here in a real implementation
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [showImageDialog]);

  const closeModal = () => {
    setShowImageDialog(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  React.useEffect(() => {
    if (showImageDialog) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showImageDialog]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return 'ร้ายแรง';
      case 'medium': return 'ปานกลาง';
      case 'low': return 'เล็กน้อย';
      default: return 'ไม่ระบุ';
    }
  };

  const allImages = [sinkhole.mainImage, ...sinkhole.additionalImages];

  return (
    <>
      <Marker position={[sinkhole.latitude, sinkhole.longitude]} icon={sinkholeIcon}>
        <Popup maxWidth={300} className="sinkhole-popup">
          <div className="space-y-3 p-2">
            {/* Header */}
            <div className="flex items-start gap-2">
              <Mountain className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">{sinkhole.title}</h3>
                <Badge variant={getSeverityColor(sinkhole.severity)} className="text-xs">
                  {getSeverityText(sinkhole.severity)}
                </Badge>
              </div>
            </div>

            {/* Main Image */}
            <div className="relative">
              <img
                src={sinkhole.mainImage}
                alt={sinkhole.title}
                className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowImageDialog(true)}
              />
              {sinkhole.additionalImages.length > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Images className="w-3 h-3" />
                  +{sinkhole.additionalImages.length}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-gray-700">{sinkhole.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-gray-700">{sinkhole.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-gray-500" />
                <span className="text-gray-700">ขนาด: {sinkhole.estimatedSize}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-3">
              {sinkhole.description}
            </p>

            <Button
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowImageDialog(true)}
            >
              <Images className="w-3 h-3 mr-1" />
              ดูรูปภาพทั้งหมด
            </Button>
          </div>
        </Popup>
      </Marker>

      {/* Image Gallery Modal */}
      {showImageDialog && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-black/40" 
            onClick={closeModal}
          />
          
          {/* Modal Panel */}
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="relative w-full max-w-[900px] md:max-w-[780px] lg:max-w-[860px] max-h-[86vh] overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute right-3 top-3 z-10 rounded-full p-2 hover:bg-black/5 transition-colors"
                aria-label="ปิดหน้าต่าง"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-4 md:p-6">
                {/* Header */}
                <h2 id="modal-title" className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mountain className="w-5 h-5 text-amber-600" />
                  ภาพรวมเหตุการณ์: {sinkhole.title}
                </h2>

                {/* Main Image */}
                <div className="aspect-video h-56 md:h-72 w-full overflow-hidden rounded-xl mb-4">
                  <img 
                    src={allImages[selectedImageIndex]} 
                    alt={`รูปภาพเหตุการณ์ ${selectedImageIndex + 1}`}
                    className="h-full w-full object-cover" 
                  />
                </div>

                {/* Thumbnail Grid */}
                {allImages.length > 1 && (
                  <div className="mb-6 grid grid-cols-4 gap-3 h-24 overflow-hidden">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        className={`h-20 overflow-hidden rounded-lg ring-1 transition-all ${
                          selectedImageIndex === index 
                            ? 'ring-2 ring-amber-500' 
                            : 'ring-black/10 hover:ring-amber-300'
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`รูปย่อ ${index + 1}`}
                          className="h-full w-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 text-sm mb-4">
                  <div>
                    <span className="font-medium text-gray-700">สถานที่:</span>
                    <p className="text-gray-600 mt-1">{sinkhole.location}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">วันที่เกิดเหตุ:</span>
                    <p className="text-gray-600 mt-1">{sinkhole.date}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">ขนาดประมาณ:</span>
                    <p className="text-gray-600 mt-1">{sinkhole.estimatedSize}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">สาเหตุเบื้องต้น:</span>
                    <p className="text-gray-600 mt-1">{sinkhole.cause}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <span className="font-medium text-gray-700">รายละเอียด:</span>
                  <p className="text-gray-700 mt-2 leading-7">{sinkhole.description}</p>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <span className="font-medium text-gray-700">สถานะ:</span>
                  <p className="text-gray-600 mt-1">{sinkhole.status}</p>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={closeModal}
                  >
                    ปิดหน้าต่าง
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SinkholeMarker;