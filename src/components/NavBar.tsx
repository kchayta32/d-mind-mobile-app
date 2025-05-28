
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';
import { MessageSquare, Phone, BookOpen, Bell } from 'lucide-react';
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

  if (isMobile) {
    // Mobile layout - 2x2 grid
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 w-full">
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
          label="การแจ้งเตือนภัยอื่นๆ"
          onClick={onAlertsClick}
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
        label="คู่มือฉุกเฉิน"
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
        label="การแจ้งเตือนภัยอื่นๆ"
        onClick={onAlertsClick}
        className="w-full justify-start text-left"
      />
    </div>
  );
};

export default NavBar;
