
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, ErrorInfo, ReactNode } from "react";
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
import RiskZoneMap from "./pages/RiskZoneMap";
import Analytics from "./pages/Analytics";
import NotificationSettings from "./pages/NotificationSettings";
import DamageAssessment from "./pages/DamageAssessment";
import ShelterFinder from "./pages/ShelterFinder";
import WeatherForecast from "./pages/WeatherForecast";
import DailyWeatherForecast from "./pages/DailyWeatherForecast";
import NotFound from "./pages/NotFound";
import MobileLayout from "@/components/layout/MobileLayout";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import { ThemeProvider } from "@/contexts/ThemeContext";

const queryClient = new QueryClient();

// Basic loading component without hooks
const BasicLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-lg opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-3xl shadow-2xl">
            <img
              src="/lovable-uploads/b5550bd4-d83d-4e1e-ac09-025117b87c86.png"
              alt="D-MIND Logo"
              className="h-20 w-20 drop-shadow-lg"
            />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            D-MIND
          </h1>
          <p className="text-blue-600/70 text-lg font-medium">
            ระบบจัดการเหตุการณ์ภาวะฉุกเฉิน
          </p>
        </div>
        <div className="text-blue-600 text-lg font-medium">กำลังเริ่มต้นระบบ...</div>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};

// Error boundary class component
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; isReady: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, isReady: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidMount() {
    // Simple timeout to ensure React is ready
    setTimeout(() => {
      this.setState({ isReady: true });
    }, 100);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
          <div className="text-center max-w-lg">
            <h1 className="text-2xl font-bold text-red-600 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-red-500 mb-4">กรุณารีเฟรชหน้าเว็บ</p>
            {this.state.error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4 text-left overflow-auto max-h-40">
                <p className="text-xs text-red-700 font-mono break-words">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              รีเฟรช
            </button>
          </div>
        </div>
      );
    }

    if (!this.state.isReady) {
      return <BasicLoadingScreen />;
    }

    return this.props.children;
  }
}

import { useBackButton } from "@/hooks/useBackButton";

// Inner component that uses the back button hook (must be inside BrowserRouter)
const AppRoutesWithBackButton = () => {
  // Handle Android hardware back button
  useBackButton();

  return (
    <Routes>
      <Route path="/risk-zones" element={<RiskZoneMap />} />
      <Route path="/disaster-map" element={<DisasterMap />} />
      <Route element={<MobileLayout />}>
        <Route path="/" element={<Index />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/manual" element={<EmergencyManual />} />
        <Route path="/contacts" element={<EmergencyContacts />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/victim-reports" element={<VictimReports />} />
        <Route path="/incident-reports" element={<IncidentReports />} />
        <Route path="/damage-assessment" element={<DamageAssessment />} />
        <Route path="/satisfaction-survey" element={<SatisfactionSurvey />} />
        <Route path="/app-guide" element={<AppGuide />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/notifications" element={<NotificationSettings />} />
        <Route path="/shelters" element={<ShelterFinder />} />
        <Route path="/weather-forecast" element={<WeatherForecast />} />
        <Route path="/daily-weather-forecast" element={<DailyWeatherForecast />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/resource/:id" element={<ResourceDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

// Main app routes component
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppRoutesWithBackButton />
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
          <InstallPrompt />
          <Toaster />
        </QueryClientProvider>
      </AppErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
