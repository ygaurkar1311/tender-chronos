import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateTender from "./pages/CreateTender";
import MyTenders from "./pages/MyTenders";
import Approvals from "./pages/Approvals";
import OpenTenders from "./pages/OpenTenders";
import MyBids from "./pages/MyBids";
import Awards from "./pages/Awards";
import Profile from "./pages/Profile";
import TenderDetails from "./pages/TenderDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navbar />
              <div className="flex">
                <Sidebar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
                    <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                    <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <PageTransition><Dashboard /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-tender"
                      element={
                        <ProtectedRoute allowedRoles={['coordinator']}>
                          <PageTransition><CreateTender /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-tenders"
                      element={
                        <ProtectedRoute allowedRoles={['coordinator']}>
                          <PageTransition><MyTenders /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/approvals"
                      element={
                        <ProtectedRoute allowedRoles={['dean', 'director', 'registrar']}>
                          <PageTransition><Approvals /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/open-tenders"
                      element={
                        <ProtectedRoute allowedRoles={['contractor']}>
                          <PageTransition><OpenTenders /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-bids"
                      element={
                        <ProtectedRoute allowedRoles={['contractor']}>
                          <PageTransition><MyBids /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/awards"
                      element={
                        <ProtectedRoute>
                          <PageTransition><Awards /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <PageTransition><Profile /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tender/:id"
                      element={
                        <ProtectedRoute>
                          <PageTransition><TenderDetails /></PageTransition>
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
                  </Routes>
                </main>
              </div>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
