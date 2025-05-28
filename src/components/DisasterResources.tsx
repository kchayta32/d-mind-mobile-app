
import React from 'react';
import ResourceCard from './ResourceCard';
import { ResourceItem, resourcesData } from '@/data/resourcesData';
import { useNavigate } from 'react-router-dom';

interface DisasterResourcesProps {
  resources?: ResourceItem[];
}

const DisasterResources: React.FC<DisasterResourcesProps> = ({ resources = resourcesData }) => {
  const navigate = useNavigate();

  const handleResourceClick = (id: string) => {
    navigate(`/resource/${id}`);
  };

  // Reverse the resources array to show top items first instead of bottom items first
  const reversedResources = [...resources].reverse();

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3">Disaster Resources</h2>
      {reversedResources.map(resource => (
        <ResourceCard
          key={resource.id}
          title={resource.title}
          description={resource.description}
          onClick={() => handleResourceClick(resource.id)}
        />
      ))}
    </div>
  );
};

export default DisasterResources;
