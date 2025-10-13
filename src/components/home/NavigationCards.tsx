import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Phone, 
  Star, 
  BookOpen, 
  Info, 
  Mail 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavigationItem {
  icon: React.ReactNode;
  titleTh: string;
  titleEn: string;
  description: string;
  route: string;
  color: string;
}

const NavigationCards: React.FC = () => {
  const navigate = useNavigate();

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="w-8 h-8" />,
      titleTh: 'หน้าแรก',
      titleEn: 'Home',
      description: 'กลับสู่หน้าหลัก',
      route: '/',
      color: 'bg-blue-500'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      titleTh: 'บริการฉุกเฉิน',
      titleEn: 'Emergency Call',
      description: 'ติดต่อหน่วยงานฉุกเฉิน',
      route: '/contacts',
      color: 'bg-red-500'
    },
    {
      icon: <Star className="w-8 h-8" />,
      titleTh: 'ประเมินความพึงพอใจ',
      titleEn: 'Evaluate Satisfaction',
      description: 'แบบสำรวจความพึงพอใจ',
      route: '/satisfaction-survey',
      color: 'bg-yellow-500'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      titleTh: 'บทความ / งานวิจัย',
      titleEn: 'Research',
      description: 'ความรู้และงานวิจัย',
      route: '/manual',
      color: 'bg-green-500'
    },
    {
      icon: <Info className="w-8 h-8" />,
      titleTh: 'เกี่ยวกับเรา',
      titleEn: 'About',
      description: 'รายละเอียดโครงการ',
      herf: 'https://d-mind.my.canva.site/', // Updated link
      color: 'bg-purple-500'
    },
    {
      icon: <Mail className="w-8 h-8" />,
      titleTh: 'ติดต่อเรา',
      titleEn: 'Contact',
      description: 'ช่องทางการติดต่อ',
      route: '/contacts',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              เมนูหลัก
            </h2>
            <p className="text-gray-600 text-lg">
              เลือกบริการที่คุณต้องการ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {navigationItems.map((item, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 overflow-hidden"
                onClick={() => navigate(item.route)}
              >
                <CardContent className="p-8">
                  <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {item.titleTh}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 font-medium">
                    {item.titleEn}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationCards;
