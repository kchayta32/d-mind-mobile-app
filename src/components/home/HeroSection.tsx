import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Droplets, Flame, Mountain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DisasterStat {
  icon: React.ReactNode;
  label: string;
  count: number;
  color: string;
}

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  const disasterStats: DisasterStat[] = [
    { icon: <AlertTriangle className="w-6 h-6" />, label: 'แผ่นดินไหว', count: 12, color: 'text-yellow-600' },
    { icon: <Droplets className="w-6 h-6" />, label: 'น้ำท่วม', count: 8, color: 'text-blue-600' },
    { icon: <Mountain className="w-6 h-6" />, label: 'ดินถล่ม', count: 5, color: 'text-orange-600' },
    { icon: <Flame className="w-6 h-6" />, label: 'ไฟป่า', count: 3, color: 'text-red-600' },
  ];

  return (
    <section className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-[hsl(var(--gradient-hero-start))] via-blue-600 to-[hsl(var(--gradient-hero-end))]">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzE0IDAgNiAyLjY4NiA2IDZzLTIuNjg2IDYtNiA2LTYtMi42ODYtNi02IDIuNjg2LTYgNi02ek0yNCAzNmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
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
              Disaster Monitoring and Intelligent Notification Device
            </p>
            <p className="text-blue-200 text-lg">
              แจ้งเตือนภัยอัจฉริยะ • ข้อมูลแบบเรียลไทม์
            </p>
          </div>

          {/* Real-time Disaster Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {disasterStats.map((stat, index) => (
              <Card 
                key={index} 
                className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className={`${stat.color} mb-3 flex justify-center`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.count}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Description and CTA */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ระบบติดตามและแจ้งเตือนภัยพิบัติอัจฉริยะ
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                D-MIND เป็นระบบ AIoT ที่ช่วยติดตามและแจ้งเตือนภัยพิบัติแบบเรียลไทม์ 
                พร้อมด้วยระบบวิเคราะห์ข้อมูลอัจฉริยะเพื่อความปลอดภัยของคุณและชุมชน
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white shadow-lg"
                  onClick={() => navigate('/disaster-map')}
                >
                  ดูแผนที่แบบเรียลไทม์
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-white hover:bg-gray-50 border-2"
                  onClick={() => navigate('/manual')}
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
