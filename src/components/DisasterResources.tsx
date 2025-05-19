
import React from 'react';
import ResourceCard from './ResourceCard';
import { useToast } from '@/components/ui/use-toast';

interface DisasterResourcesProps {
  resources: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

const DisasterResources: React.FC<DisasterResourcesProps> = ({ resources }) => {
  const { toast } = useToast();

  const handleResourceClick = (title: string) => {
    toast({
      title: `Opening ${title}`,
      description: "This would open the full resource content in a complete app.",
    });
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Disaster Resources</h2>
      {resources.map(resource => (
        <ResourceCard
          key={resource.id}
          title={resource.title}
          description={resource.description}
          onClick={() => handleResourceClick(resource.title)}
        />
      ))}
    </div>
  );
};

export default DisasterResources;
