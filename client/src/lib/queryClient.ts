import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = endpoint.startsWith("http") 
    ? endpoint 
    : `${import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}${endpoint}`;

  // Add JWT token to requests if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  if (userRole) {
    headers['x-user-role'] = userRole;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  await throwIfResNotOk(response);
  
  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [endpoint, params] = queryKey as [string, Record<string, any>?];
    const url = new URL(endpoint, window.location.origin);
    
    console.log("Query params received:", params);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }

    console.log("Final URL:", url.toString());

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const headers: Record<string, string> = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (userRole) {
      headers['x-user-role'] = userRole;
    }
    
    const res = await fetch(url.toString(), {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
