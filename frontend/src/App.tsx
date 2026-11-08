import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import RagQATab from "./components/RagQATab.tsx";
import AuditTab from "./components/AuditTab.tsx";
import DocumentUploadTab from "./components/DocumentUploadTab.tsx";
import SystemStatusTab from "./components/SystemStatusTab.tsx";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Index />}>
            <Route index element={<Navigate to="/upload" replace />} />
            <Route path="qa" element={<RagQATab />} />
            <Route path="audit" element={<AuditTab />} />
            <Route path="upload" element={<DocumentUploadTab />} />
            <Route path="status" element={<SystemStatusTab />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
