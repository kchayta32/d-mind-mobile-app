
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface ResourceCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ title, description, onClick }) => {
  return (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ArrowRight size={20} className="text-guardian-purple" />
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
