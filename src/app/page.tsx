"use client";

import { useAuth } from "@/hooks/useAuth";
import Landing from "@/components/pages/landing";
import Home from "@/components/pages/home";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Landing />;
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return <Home />;
} 