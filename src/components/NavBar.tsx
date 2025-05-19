
import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavButton from './NavButton';
import { MessageSquare, Phone, BookOpen } from 'lucide-react';

interface NavBarProps {
  onAssistantClick: () => void;
  onManualClick: () => void;
  onContactsClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ 
  onAssistantClick, 
  onManualClick,
  onContactsClick
}) => {
  return (
    <div className="flex gap-3 mb-6 w-full">
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
    </div>
  );
};

export default NavBar;
