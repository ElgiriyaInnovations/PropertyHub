import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";

export function useAuth() {
  // Check if we're in the browser environment
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  const [userRole, setUserRole] = useState<"buyer" | "seller" | "broker">("buyer");
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasToken, // Only run if token exists
    refetchOnWindowFocus: false,
  });

  // Load role from localStorage and listen for changes
  useEffect(() => {
    const updateRole = () => {
      if (typeof window !== 'undefined') {
        const savedRole = localStorage.getItem('userRole') as "buyer" | "seller" | "broker";
        if (savedRole && ["buyer", "seller", "broker"].includes(savedRole)) {
          setUserRole(savedRole);
        }
      }
    };

    // Initial load
    updateRole();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userRole') {
        updateRole();
      }
    };

    // Listen for custom events (for same-tab updates)
    const handleRoleChange = () => {
      updateRole();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('roleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  // Merge user data with localStorage role, but prioritize API role if it exists
  const userWithRole = user ? { 
    ...user, 
    role: user?.role || userRole 
  } : user;

  return {
    user: userWithRole,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated: !!user && hasToken,
  };
}
