
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EmergencyManual from "./pages/EmergencyManual";
import EmergencyContacts from "./pages/EmergencyContacts";
import AIAssistant from "./pages/AIAssistant";
import ResourceDetail from "./pages/ResourceDetail";
import LoadingScreen from "./components/LoadingScreen";

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Create the App component
const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  // For demonstration purposes, show loading screen for minimum time
  useEffect(() => {
    const minLoadTime = setTimeout(() => {
      // This ensures the loading screen shows for at least 3 seconds
      // even if the app loads faster
      window.addEventListener('load', () => {
        setIsLoading(false);
      });
      
      // If window already loaded, we can hide the loading screen
      if (document.readyState === 'complete') {
        setIsLoading(false);
      }
    }, 3000);
    
    return () => clearTimeout(minLoadTime);
  }, []);
  
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };
  
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/manual" element={<EmergencyManual />} />
            <Route path="/contacts" element={<EmergencyContacts />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
