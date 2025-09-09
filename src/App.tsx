import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Platform from "./pages/Platform";
import DashboardUGC from "./pages/DashboardUGC";
import DashboardCreator from "./pages/DashboardCreator";
import Content from "./pages/Content";
import Performance from "./pages/Performance";
import Analytics from "./pages/Analytics";
import DebugSeed from "./pages/DebugSeed";
import DebugSeedFull from "./pages/DebugSeedFull";
import DebugRunSql from "./pages/DebugRunSql";
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
            <Route path="/" element={<Index />} />
            <Route path="/platform/:platform" element={<Platform />} />
            <Route path="/dashboard-creator" element={<DashboardCreator />} />
            <Route path="/dashboard-ugc" element={<DashboardUGC />} />
            <Route path="/content" element={<Content />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/debug/seed" element={<DebugSeed />} />
            <Route path="/debug/seed-full" element={<DebugSeedFull />} />
            <Route path="/debug/run-sql" element={<DebugRunSql />} />
            <Route path="/dev/wiring-export" element={<WiringExport />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
