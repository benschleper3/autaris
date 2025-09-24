import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import FeaturesPage from "./pages/FeaturesPage";
import FAQPage from "./pages/FAQPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AuthDebug from "./pages/AuthDebug";
import RequireAuth from "./components/auth/RequireAuth";
import UGCCreatorDashboard from "./components/ugc/UGCCreatorDashboard";
import WiringExport from "./pages/WiringExport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/debug" element={<AuthDebug />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/dashboard-ugc" element={<RequireAuth><UGCCreatorDashboard /></RequireAuth>} />
            <Route path="/dev/wiring-export" element={<WiringExport />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;