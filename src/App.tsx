
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import AppLoader from "./components/AppLoader";
import ServiceWorkerProvider from "./components/ServiceWorkerProvider";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <AppLoader>
        <ServiceWorkerProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
                  <Route path="/article/:id" element={<ArticleDetail />} />
                  <Route path="/resource/:id" element={<ResourceDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
                <Sonner />
              </BrowserRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </ServiceWorkerProvider>
      </AppLoader>
    </ErrorBoundary>
  );
};

export default App;
