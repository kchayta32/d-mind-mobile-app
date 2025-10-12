import React from 'react';
import HeroSection from './HeroSection';
import NavigationCards from './NavigationCards';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe, Menu, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NewDesktopLayout: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [language, setLanguage] = React.useState<'th' | 'en'>('th');
  const [menuOpen, setMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const menuItems = [
    { labelTh: 'หน้าแรก', labelEn: 'Home', route: '/' },
    { labelTh: 'บริการฉุกเฉิน', labelEn: 'Emergency Call', route: '/contacts' },
    { labelTh: 'รายงานผู้ประสบภัย', labelEn: 'Victim Reports', route: '/victim-reports' },
    { labelTh: 'รายงานเหตุการณ์', labelEn: 'Incident Reports', route: '/incident-reports' },
    { labelTh: 'ประเมินความพึงพอใจ', labelEn: 'Evaluate Satisfaction', route: '/satisfaction-survey' },
    { labelTh: 'บทความ / งานวิจัย', labelEn: 'Research', route: '/manual' },
    { labelTh: 'คุยกับเอไอ', labelEn: 'Assistant', route: '/assistant' },
    { labelTh: 'เกี่ยวกับเรา', labelEn: 'About', route: '/app-guide' },
    { labelTh: 'ติดต่อเรา', labelEn: 'Contact', route: '/contacts' },
  ];

  const handleMenuClick = (route: string) => {
    navigate(route);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-xl">D-MIND</span>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setIsDark(!isDark)}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
            >
              <Globe className="h-4 w-4 mr-2" />
              {language === 'th' ? 'TH' : 'EN'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
              <span className="ml-2">Search</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="ml-2">Menu</span>
            </Button>
          </div>
        </div>

        {/* Dropdown Menu */}
        <div
          className={`absolute top-full left-0 right-0 bg-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out ${
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item.route)}
                  className="group text-left p-4 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  <h3 className="text-white text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                    {language === 'th' ? item.labelTh : item.labelEn}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {language === 'th' ? item.labelEn : item.labelTh}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with padding for fixed nav */}
      <div className="pt-16">
        {/* Hero Section */}
        <HeroSection />

        {/* Navigation Cards */}
        <NavigationCards />

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-8">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-400">
              © 2025 D-MIND | AI Innovator SSRU Team
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Disaster Monitoring and Intelligent Notification Device
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NewDesktopLayout;
