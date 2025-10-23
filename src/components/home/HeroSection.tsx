import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/images/hero-background.png)' }}></div>
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-20 w-20 drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              D-MIND
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-medium mb-2">
              A Disaster Monitoring and Intelligent Notification System
            </p>
            <p className="text-blue-200 text-lg">
              ระบบติดตามภัยพิบัติ • แจ้งเตือนอัจฉริยะ
            </p>
          </div>

          {/* Description and CTA */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ระบบติดตามและแจ้งเตือนภัยพิบัติอัจฉริยะ
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                D-MIND เป็นระบบ AIoT ที่ช่วยติดตามและแจ้งเตือนภัยพิบัติแบบอัจฉริยะ 
                พร้อมด้วยระบบวิเคราะห์ข้อมูลอัจฉริยะเพื่อความปลอดภัยของคุณและชุมชน
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                  onClick={() => navigate('/disaster-map')}
                >
                  ดูแผนที่
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50 border-2"
                  onClick={() => navigate('/app-guide')}
                >
                  เริ่มต้นใช้งาน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
