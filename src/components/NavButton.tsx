
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
        "h-auto p-4 flex items-center justify-center gap-3 font-medium text-sm",
        isMobile ? "flex-col min-h-[80px]" : "flex-row justify-start",
        "border-2 shadow-sm hover:shadow-md transition-all duration-300 rounded-xl",
        "backdrop-blur-sm",
        className
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      {isMobile ? (
        <span className="text-xs font-medium text-center leading-tight">{label}</span>
      ) : (
        <span className="font-medium">{label}</span>
      )}
    </Button>
  );
};

export default NavButton;
