import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export function useRoleSwitch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentRole, setCurrentRole] = useState<"buyer" | "seller" | "broker">("buyer");

  // Load role from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as "buyer" | "seller" | "broker";
      if (savedRole && ["buyer", "seller", "broker"].includes(savedRole)) {
        setCurrentRole(savedRole);
      }
    }
  }, []);

  const switchRole = (newRole: "buyer" | "seller" | "broker") => {
    if (newRole === currentRole) return;
    
    setIsUpdating(true);
    
    // Store role in localStorage
    localStorage.setItem('userRole', newRole);
    setCurrentRole(newRole);
    
    // Update the user data in the query cache to reflect the new role
    queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
      if (oldData) {
        return { ...oldData, role: newRole };
      }
      return oldData;
    });
    
    const roleLabels = {
      buyer: "Buyer",
      seller: "Seller", 
      broker: "Broker"
    };
    
    toast({
      title: "Role Updated",
      description: `You are now a ${roleLabels[newRole]}`,
    });
    
    setIsUpdating(false);
  };

  return {
    switchRole,
    isUpdating,
    currentRole
  };
} 