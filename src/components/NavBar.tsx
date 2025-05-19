
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';
import { MessageSquare, Phone, BookOpen, Bell } from 'lucide-react';

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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 w-full">
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
};

export default NavBar;
