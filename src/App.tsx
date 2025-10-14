import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { useIsMobile } from "./hooks/use-mobile";
import { DesktopOnlyScreen } from "./components/DesktopOnlyScreen";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import Admin from "./pages/admin/Admin";
import Instructor from "./pages/instructor/Instructor";
import Student from "./pages/student/Student";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();

  // Show desktop-only screen for mobile users
  if (isMobile) {
    return <DesktopOnlyScreen />;
  }

  // Show normal app for desktop users
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/instructor" element={<Instructor />} />
        <Route path="/student" element={<Student />} />
        <Route path="/checkin" element={<CheckIn />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
