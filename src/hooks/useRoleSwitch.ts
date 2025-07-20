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

  const switchRole = async (newRole: "buyer" | "seller" | "broker") => {
    if (newRole === currentRole) return;
    
    setIsUpdating(true);
    
    try {
      // Store role in localStorage
      localStorage.setItem('userRole', newRole);
      setCurrentRole(newRole);
      
      // Dispatch custom event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('roleChanged'));
      }
      
      // Update the user data in the query cache to reflect the new role
      queryClient.setQueryData(["/api/auth/user"], (oldData: any) => {
        if (oldData) {
          return { ...oldData, role: newRole };
        }
        return oldData;
      });
      
      // Also invalidate the user query to force a refresh
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      const roleLabels = {
        buyer: "Buyer",
        seller: "Seller", 
        broker: "Broker"
      };
      
      toast({
        title: "Role Updated",
        description: `You are now a ${roleLabels[newRole]}`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    switchRole,
    isUpdating,
    currentRole
  };
} 