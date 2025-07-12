import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import ServiceWorkerProvider from "./components/ServiceWorkerProvider";
import Index from "./pages/Index";
import AIAssistant from "./pages/AIAssistant";
import EmergencyManual from "./pages/EmergencyManual";
import EmergencyContacts from "./pages/EmergencyContacts";
import Alerts from "./pages/Alerts";
import VictimReports from "./pages/VictimReports";
import IncidentReports from "./pages/IncidentReports";
import SatisfactionSurvey from "./pages/SatisfactionSurvey";
import AppGuide from "./pages/AppGuide";
import ArticleDetail from "./pages/ArticleDetail";
import ResourceDetail from "./pages/ResourceDetail";
import DisasterMap from "./pages/DisasterMap";
import Analytics from "./pages/Analytics";
import NotificationSettings from "./pages/NotificationSettings";
import DamageAssessment from "./pages/DamageAssessment";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Main app content after all providers are ready
const AppRoutes = () => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/manual" element={<EmergencyManual />} />
        <Route path="/contacts" element={<EmergencyContacts />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/disaster-map" element={<DisasterMap />} />
        <Route path="/victim-reports" element={<VictimReports />} />
        <Route path="/incident-reports" element={<IncidentReports />} />
        <Route path="/damage-assessment" element={<DamageAssessment />} />
        <Route path="/satisfaction-survey" element={<SatisfactionSurvey />} />
        <Route path="/app-guide" element={<AppGuide />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<NotificationSettings />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/resource/:id" element={<ResourceDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

// Component that provides all contexts and toasters
const AppWithProviders = () => {
  const [providersReady, setProvidersReady] = useState(false);

  useEffect(() => {
    // Ensure providers are ready before rendering toasters
    const timer = setTimeout(() => {
      setProvidersReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {providersReady && (
        <ServiceWorkerProvider>
          <AppRoutes />
        </ServiceWorkerProvider>
      )}
      {providersReady && (
        <>
          <Toaster />
          <Sonner />
        </>
      )}
    </QueryClientProvider>
  );
};

const App = () => {
  const [isReactReady, setIsReactReady] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Multi-step initialization to ensure React is fully ready
    const initializeApp = () => {
      // First, ensure React is mounted
      setIsReactReady(true);
      
      // Then, in the next tick, initialize providers
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    };

    // Use requestAnimationFrame to ensure we're in the next frame
    requestAnimationFrame(initializeApp);
  }, []);

  // Show loading state while React is initializing
  if (!isReactReady || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-blue-600 text-lg font-medium">กำลังเริ่มต้นระบบ...</div>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return <AppWithProviders />;
};

export default App;
