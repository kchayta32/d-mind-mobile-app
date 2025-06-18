
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AIAssistant from "./pages/AIAssistant";
import EmergencyManual from "./pages/EmergencyManual";
import EmergencyContacts from "./pages/EmergencyContacts";
import Alerts from "./pages/Alerts";
import VictimReports from "./pages/VictimReports";
import SatisfactionSurvey from "./pages/SatisfactionSurvey";
import ArticleDetail from "./pages/ArticleDetail";
import ResourceDetail from "./pages/ResourceDetail";
import AppGuide from "./pages/AppGuide";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import SharedData from "./pages/SharedData";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/manual" element={<EmergencyManual />} />
          <Route path="/contacts" element={<EmergencyContacts />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/victim-reports" element={<VictimReports />} />
          <Route path="/survey" element={<SatisfactionSurvey />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/resource/:id" element={<ResourceDetail />} />
          <Route path="/guide" element={<AppGuide />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shared-data" element={<SharedData />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
