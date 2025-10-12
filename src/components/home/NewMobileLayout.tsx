import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  Phone, 
  Star, 
  BookOpen, 
  Info, 
  Mail,
  Moon,
  Sun,
  Globe,
  MapPin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewMobileLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(false);
  const [language, setLanguage] = React.useState<'th' | 'en'>('th');
  const [activeTab, setActiveTab] = React.useState('home');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const quickActions = [
    { icon: <Home className="w-6 h-6" />, label: 'หน้าแรก', route: '/', id: 'home' },
    { icon: <MapPin className="w-6 h-6" />, label: 'แผนที่', route: '/disaster-map', id: 'map' },
    { icon: <Phone className="w-6 h-6" />, label: 'ฉุกเฉิน', route: '/contacts', id: 'emergency' },
    { icon: <BookOpen className="w-6 h-6" />, label: 'คู่มือ', route: '/manual', id: 'manual' },
    { icon: <Info className="w-6 h-6" />, label: 'เพิ่มเติม', route: '/app-guide', id: 'more' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile Header */}
      <header className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
                alt="D-MIND Logo" 
                className="h-10 w-10"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-800 dark:text-white">D-MIND</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Disaster Monitor</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
              >
                <Globe className="h-3 w-3 mr-1" />
                <span className="text-xs">{language.toUpperCase()}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-blue-700 px-4 py-8 text-white">
        <h2 className="text-2xl font-bold mb-2">ยินดีต้อนรับ</h2>
        <p className="text-blue-100 text-sm mb-4">
          ระบบติดตามภัยพิบัติและแจ้งเตือนอัจฉริยะ
        </p>
        <Button 
          className="w-full bg-white text-primary hover:bg-gray-100"
          onClick={() => navigate('/disaster-map')}
        >
          ดูแผนที่ภัยพิบัติ
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-4">
        <Card className="shadow-xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xl font-bold text-yellow-600">12</div>
                <div className="text-xs text-gray-600">แผ่นดินไหว</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">8</div>
                <div className="text-xs text-gray-600">น้ำท่วม</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">5</div>
                <div className="text-xs text-gray-600">ดินถล่ม</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">3</div>
                <div className="text-xs text-gray-600">ไฟป่า</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">เมนูหลัก</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/contacts')}
          >
            <CardContent className="p-4 text-center">
              <div className="bg-red-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white mx-auto">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-white">บริการฉุกเฉิน</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/survey')}
          >
            <CardContent className="p-4 text-center">
              <div className="bg-yellow-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white mx-auto">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-white">ประเมินความพึงพอใจ</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/manual')}
          >
            <CardContent className="p-4 text-center">
              <div className="bg-green-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-white">บทความ / วิจัย</div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/app-guide')}
          >
            <CardContent className="p-4 text-center">
              <div className="bg-purple-500 w-12 h-12 rounded-xl flex items-center justify-center mb-2 text-white mx-auto">
                <Info className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-white">เกี่ยวกับเรา</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t shadow-lg z-40">
        <div className="grid grid-cols-5">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                setActiveTab(action.id);
                navigate(action.route);
              }}
              className={`flex flex-col items-center justify-center py-3 transition-colors ${
                activeTab === action.id 
                  ? 'text-primary' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {action.icon}
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default NewMobileLayout;
