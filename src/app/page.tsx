"use client";

import { useAuth } from "@/hooks/useAuth";
import Landing from "@/components/pages/landing";
import Home from "@/components/pages/home";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();

  // Always show landing page when not authenticated, even during loading
  if (!isAuthenticated) {
    return <Landing />;
  }

  // Only show home page when authenticated
  return <Home />;
} 