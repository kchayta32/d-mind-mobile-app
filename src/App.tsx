
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Main app content with routing
const AppRoutes = () => {
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

// Component that handles loading and service worker after everything is mounted
const AppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Initialize service worker after component mounts and providers are ready
  useEffect(() => {
    // Add a small delay to ensure all providers are fully initialized
    const timer = setTimeout(() => {
      setIsServiceWorkerReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <>
      {isServiceWorkerReady && <ServiceWorkerManager />}
      <AppRoutes />
    </>
  );
};

// Service worker component that only renders after everything is ready
const ServiceWorkerManager = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Inline service worker logic to avoid hook issues
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    }
  }, [isMounted]);

  return null;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
