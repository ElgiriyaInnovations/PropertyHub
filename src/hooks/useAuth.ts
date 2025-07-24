import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

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
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
