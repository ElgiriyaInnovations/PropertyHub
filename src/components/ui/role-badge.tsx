import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

export function RoleBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleConfig = (role: string) => {
    switch (role) {
      case "buyer":
        return {
          label: "🏠 Buyer",
          className: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "seller":
        return {
          label: "📋 Seller", 
          className: "bg-green-100 text-green-800 border-green-200"
        };
      case "broker":
        return {
          label: "👔 Broker",
          className: "bg-purple-100 text-purple-800 border-purple-200"
        };
      default:
        return {
          label: "🏠 Buyer",
          className: "bg-blue-100 text-blue-800 border-blue-200"
        };
    }
  };

  const roleConfig = getRoleConfig(user.role || "buyer");

  return (
    <Badge 
      variant="secondary" 
      className={`text-sm px-4 py-2 border ${roleConfig.className}`}
    >
      {roleConfig.label}
    </Badge>
  );
} 