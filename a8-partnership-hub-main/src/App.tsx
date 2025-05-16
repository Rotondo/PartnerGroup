
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index"; // Página de login/cadastro
import Opportunities from "./pages/Opportunities";
import OpportunityDetail from "./pages/OpportunityDetail";
import Partners from "./pages/Partners";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Importar ProtectedRoute
import DashboardLayout from "@/components/layout/DashboardLayout"; // Importar DashboardLayout para rotas protegidas

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} /> {/* Rota pública para login/cadastro */}
          
          {/* Rotas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout><Index /></DashboardLayout>} /> {/* Página inicial do dashboard após login */}
            <Route path="/opportunities" element={<DashboardLayout><Opportunities /></DashboardLayout>} />
            <Route path="/opportunity/:id" element={<DashboardLayout><OpportunityDetail /></DashboardLayout>} />
            <Route path="/partners" element={<DashboardLayout><Partners /></DashboardLayout>} />
            <Route path="/reports" element={<DashboardLayout><Reports /></DashboardLayout>} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
