
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, onClick, className }) => {
  const isMobile = useIsMobile();

  return (
    <Button 
      variant="outline" 
      className={cn(
        "h-auto p-4 flex flex-col items-center justify-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </Button>
  );
};

export default NavButton;
