import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';

interface JWTHook {
  refreshToken: () => Promise<boolean>;
  isRefreshing: boolean;
  clearTokens: () => void;
}

export function useJWT(): JWTHook {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user } = useAuth();

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshing) return false;
    
    setIsRefreshing(true);
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Tokens are automatically set as HTTP-only cookies by the server
        // No need to store in localStorage for security
        
        // Trigger a page reload to update authentication state
        window.location.reload();
        return true;
      } else {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        window.location.href = '/auth';
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      window.location.href = '/auth';
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  const clearTokens = useCallback(() => {
    // Only clear userRole from localStorage, tokens are in HTTP-only cookies
    localStorage.removeItem('userRole');
    
    // Clear cookies by calling logout API
    fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(console.error);
  }, []);

  // Auto-refresh token when it's about to expire
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiry = async () => {
      // Since tokens are in HTTP-only cookies, we can't access them from client
      // Instead, we'll make a lightweight API call to check token status
      try {
        const response = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.status === 401) {
          // Token is expired or invalid, try to refresh
          await refreshToken();
        }
      } catch (error) {
        console.error('Error checking token status:', error);
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);
    checkTokenExpiry(); // Check immediately

    return () => clearInterval(interval);
  }, [user, refreshToken]);

  return {
    refreshToken,
    isRefreshing,
    clearTokens,
  };
} 