
import React, { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import LoadingScreen from "./components/Layout/LoadingScreen";
import Index from "./pages/Index";
import EventDetails from "./pages/EventDetails";
import BookingPage from "./pages/BookingPage";
import Venues from "./pages/Venues";
import Organizers from "./pages/Organizers";
import OrganizerDetail from "./pages/OrganizerDetail";
import Categories from "./pages/Categories";
import Events from "./pages/Events";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import EventsCreate from "./pages/EventsCreate";
import EventsEdit from "./pages/EventsEdit";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = "715592021110-v6q8btevo8b3b4b6gou6lu58qb0bss02.apps.googleusercontent.com";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/create" element={<EventsCreate />} />
                <Route path="/events/edit/:id" element={<EventsEdit />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/book/:id" element={<BookingPage />} />
                <Route path="/venues" element={<Venues />} />
                <Route path="/organizers" element={<Organizers />} />
                <Route path="/organizer/:id" element={<OrganizerDetail />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/profile" element={<Profile />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
