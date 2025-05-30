
import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SecurityBadgeProps {
  type: 'secure' | 'private' | 'protected';
  className?: string;
}

const SecurityBadge: React.FC<SecurityBadgeProps> = ({ type, className = '' }) => {
  const config = {
    secure: {
      icon: Shield,
      text: 'ปลอดภัย',
      color: 'bg-green-100 text-green-800'
    },
    private: {
      icon: Eye,
      text: 'ส่วนตัว',
      color: 'bg-blue-100 text-blue-800'
    },
    protected: {
      icon: Lock,
      text: 'ต้องลงชื่อเข้าใช้',
      color: 'bg-yellow-100 text-yellow-800'
    }
  };

  const { icon: Icon, text, color } = config[type];

  return (
    <Badge variant="secondary" className={`${color} ${className}`}>
      <Icon className="h-3 w-3 mr-1" />
      {text}
    </Badge>
  );
};

export default SecurityBadge;
