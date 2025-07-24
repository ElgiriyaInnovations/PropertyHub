import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useRoleSwitch() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentRole, setCurrentRole] = useState<"buyer" | "seller" | "broker" | undefined>(undefined);

  // Load role from localStorage on mount and when user changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRole = localStorage.getItem('userRole') as "buyer" | "seller" | "broker";
      if (savedRole && ["buyer", "seller", "broker"].includes(savedRole)) {
        setCurrentRole(savedRole);
      } else {
        // Set default role if none exists
        localStorage.setItem('userRole', 'buyer');
        setCurrentRole('buyer');
      }
    }
  }, [user?.id]); // Re-run when user changes

  // Navigate to role-specific homepage on initial load if user is authenticated
  useEffect(() => {
    if (user && currentRole && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const roleHomepages = {
        buyer: "/",
        seller: "/properties",
        broker: "/properties"
      };
      
      // Only navigate if we're not already on the correct homepage
      const expectedHomepage = roleHomepages[currentRole];
      if (currentPath !== expectedHomepage && 
          (currentPath === "/" || currentPath === "/properties")) {
        router.push(expectedHomepage);
      }
    }
  }, [user, currentRole, router]);

  const switchRole = async (newRole: "buyer" | "seller" | "broker") => {
    if (newRole === currentRole) return;
    
    setIsUpdating(true);
    
    try {
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

      // Navigate to role-specific homepage
      const roleHomepages = {
        buyer: "/", // Main homepage for buyers
        seller: "/properties", // Properties page showing seller's listings
        broker: "/properties" // Properties page for brokers
      };
      
      // Navigate to the appropriate homepage for the new role
      router.push(roleHomepages[newRole]);
      
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