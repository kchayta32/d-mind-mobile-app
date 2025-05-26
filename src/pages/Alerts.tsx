
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterAlerts } from '@/components/disaster-alerts/useDisasterAlerts';
import AlertFilters from '@/components/disaster-alerts/AlertFilters';
import AlertsList from '@/components/disaster-alerts/AlertsList';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { 
    alerts, 
    isLoading, 
    filters, 
    updateFilters, 
    refetch, 
    alertTypes, 
    severityLevels 
  } = useDisasterAlerts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 shadow-lg">
        <div className="container mx-auto flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white mr-3 hover:bg-blue-400/30 rounded-full" 
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png" 
              alt="D-MIND Logo" 
              className="h-8 w-8 mr-3"
            />
            <h1 className="text-xl font-bold">การแจ้งเตือนภัยพิบัติอื่นๆ</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 max-w-3xl">
        <div className="mb-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            disabled={isLoading}
            className="flex items-center gap-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>
        
        <AlertFilters
          filters={filters}
          updateFilters={updateFilters}
          availableTypes={alertTypes}
          availableSeverities={severityLevels}
        />
        
        <AlertsList
          alerts={alerts}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default Alerts;
