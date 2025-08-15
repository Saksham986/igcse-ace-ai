import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Resources from "./pages/Resources";
import Assess from "./pages/Assess";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => {
  const rawBase = (import.meta.env.BASE_URL as string) || "/";
  const basename = rawBase.replace(/\/+$/, "");
  const RouterComponent = import.meta.env.PROD ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterComponent basename={import.meta.env.PROD ? undefined : basename}>
          <Routes>
            <Route index element={<Index />} />
            <Route path="auth" element={<Auth />} />
            <Route path="resources" element={<Resources />} />
            <Route path="assess" element={<Assess />} />
            <Route path="quiz" element={<Quiz />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </RouterComponent>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
