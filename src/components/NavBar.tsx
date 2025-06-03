
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';
import { MessageSquare, Phone, BookOpen, Bell, Star, HelpCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavBarProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
  onAlertsClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  onAssistantClick, 
  onManualClick,
  onContactsClick,
  onAlertsClick
}) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSurveyClick = () => {
    navigate('/satisfaction-survey');
  };

  const handleAppGuideClick = () => {
    navigate('/app-guide');
  };

  if (isMobile) {
    // Mobile layout with modern grid design
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 w-full">
          <NavButton 
            icon={<MessageSquare size={24} />}
            label="AI Assistant"
            onClick={onAssistantClick}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          />
          <NavButton 
            icon={<BookOpen size={24} />}
            label="Emergency Manual"
            onClick={onManualClick}
            className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          />
          <NavButton 
            icon={<Phone size={24} />}
            label="Emergency Contacts"
            onClick={onContactsClick}
            className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          />
          <NavButton 
            icon={<Bell size={24} />}
            label="การแจ้งเตือนภัยทั้งหมด"
            onClick={onAlertsClick}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          />
          <NavButton 
            icon={<HelpCircle size={24} />}
            label="คู่มือการใช้งานแอพ"
            onClick={handleAppGuideClick}
            className="col-span-2 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          />
        </div>
        
        {/* Survey Button with special styling */}
        <NavButton 
          icon={<Star size={24} />}
          label="ประเมินความพึงพอใจ"
          onClick={handleSurveyClick}
          className="w-full bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-amber-700 hover:from-yellow-200 hover:to-amber-200 hover:border-yellow-400 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        />
      </div>
    );
  }

  // Desktop layout with enhanced styling
  return (
    <div className="space-y-3 w-full">
      <NavButton 
        icon={<MessageSquare size={20} />}
        label="AI Assistant"
        onClick={onAssistantClick}
        className="w-full justify-start text-left bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300"
      />
      <NavButton 
        icon={<BookOpen size={20} />}
        label="คู่มือและบทความ"
        onClick={onManualClick}
        className="w-full justify-start text-left bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-md hover:shadow-lg transition-all duration-300"
      />
      <NavButton 
        icon={<Phone size={20} />}
        label="หมายเลขฉุกเฉิน"
        onClick={onContactsClick}
        className="w-full justify-start text-left bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-700 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 shadow-md hover:shadow-lg transition-all duration-300"
      />
      <NavButton 
        icon={<Bell size={20} />}
        label="การแจ้งเตือนภัยทั้งหมด"
        onClick={onAlertsClick}
        className="w-full justify-start text-left bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 shadow-md hover:shadow-lg transition-all duration-300"
      />
      <NavButton 
        icon={<HelpCircle size={20} />}
        label="คู่มือการใช้งานแอพ"
        onClick={handleAppGuideClick}
        className="w-full justify-start text-left bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700 hover:from-indigo-100 hover:to-indigo-200 hover:border-indigo-300 shadow-md hover:shadow-lg transition-all duration-300"
      />
      <NavButton 
        icon={<Star size={20} />}
        label="ประเมินความพึงพอใจ"
        onClick={handleSurveyClick}
        className="w-full justify-start text-left bg-gradient-to-r from-yellow-100 to-amber-100 border-yellow-300 text-amber-700 hover:from-yellow-200 hover:to-amber-200 hover:border-yellow-400 shadow-md hover:shadow-lg transition-all duration-300"
      />
    </div>
  );
};

export default NavBar;
