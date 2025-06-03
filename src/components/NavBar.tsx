
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
    // Mobile layout - 2x3 grid + survey button
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 w-full">
          <NavButton 
            icon={<MessageSquare size={24} />}
            label="AI Assistant"
            onClick={onAssistantClick}
          />
          <NavButton 
            icon={<BookOpen size={24} />}
            label="Emergency Manual"
            onClick={onManualClick}
          />
          <NavButton 
            icon={<Phone size={24} />}
            label="Emergency Contacts"
            onClick={onContactsClick}
          />
          <NavButton 
            icon={<Bell size={24} />}
            label="การแจ้งเตือนภัยทั้งหมด"
            onClick={onAlertsClick}
          />
          <NavButton 
            icon={<HelpCircle size={24} />}
            label="คู่มือการใช้งานแอพ"
            onClick={handleAppGuideClick}
            className="col-span-2"
          />
        </div>
        
        {/* Survey Button - Full width on mobile */}
        <NavButton 
          icon={<Star size={24} />}
          label="ประเมินความพึงพอใจ"
          onClick={handleSurveyClick}
          className="w-full bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-orange-600 hover:text-orange-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100"
        />
      </div>
    );
  }

  // Desktop layout - vertical list
  return (
    <div className="space-y-2 w-full">
      <NavButton 
        icon={<MessageSquare size={20} />}
        label="AI Assistant"
        onClick={onAssistantClick}
        className="w-full justify-start text-left"
      />
      <NavButton 
        icon={<BookOpen size={20} />}
        label="คู่มือและบทความ"
        onClick={onManualClick}
        className="w-full justify-start text-left"
      />
      <NavButton 
        icon={<Phone size={20} />}
        label="หมายเลขฉุกเฉิน"
        onClick={onContactsClick}
        className="w-full justify-start text-left"
      />
      <NavButton 
        icon={<Bell size={20} />}
        label="การแจ้งเตือนภัยทั้งหมด"
        onClick={onAlertsClick}
        className="w-full justify-start text-left"
      />
      <NavButton 
        icon={<HelpCircle size={20} />}
        label="คู่มือการใช้งานแอพ"
        onClick={handleAppGuideClick}
        className="w-full justify-start text-left"
      />
      <NavButton 
        icon={<Star size={20} />}
        label="ประเมินความพึงพอใจ"
        onClick={handleSurveyClick}
        className="w-full justify-start text-left bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 text-orange-600 hover:text-orange-700 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-orange-100"
      />
    </div>
  );
};

export default NavBar;
