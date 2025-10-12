import React from 'react';
import HeroSection from './HeroSection';
import NavigationCards from './NavigationCards';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Globe } from 'lucide-react';

const NewDesktopLayout: React.FC = () => {
  const [isDark, setIsDark] = React.useState(false);
  const [language, setLanguage] = React.useState<'th' | 'en'>('th');

  React.useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="fixed top-0 right-0 z-50 p-4 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg"
          onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'th' ? 'TH' : 'EN'}
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* Navigation Cards */}
      <NavigationCards />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
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
  );
};

export default NewDesktopLayout;
