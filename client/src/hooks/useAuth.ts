import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Check if we're in the browser environment
  const hasToken = typeof window !== 'undefined' ? !!localStorage.getItem('accessToken') : false;
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    enabled: hasToken, // Only run if token exists
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading: hasToken ? isLoading : false,
    isAuthenticated: !!user && hasToken,
  };
}
