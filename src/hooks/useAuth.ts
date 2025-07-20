import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect } from "react";

// API request function
const fetchUser = async (): Promise<User> => {
  const response = await fetch('/api/auth/user', {
    credentials: 'include', // Include cookies
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
};

export function useAuth() {
  // Check if we're in the browser environment
  const [userRole, setUserRole] = useState<"buyer" | "seller" | "broker">("buyer");
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
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
    isLoading,
    isAuthenticated: !!user,
  };
}
