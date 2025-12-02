import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
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

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const AppContent = () => {
  const isMobile = useIsMobile();
  const { isLoading } = useAuth();

  // Show loading screen while auth is initializing
  if (isLoading) {
    return <LoadingScreen />;
  }

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
