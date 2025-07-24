import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Building2, 
  Briefcase,
  Check,
  Loader2
} from "lucide-react";

const roleConfig = {
  buyer: {
    label: "Buyer",
    description: "Looking for properties",
    icon: Home,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    activeColor: "bg-blue-500 text-white border-blue-500"
  },
  seller: {
    label: "Seller", 
    description: "Listing properties",
    icon: Building2,
    color: "bg-green-100 text-green-800 border-green-200",
    activeColor: "bg-green-500 text-white border-green-500"
  },
  broker: {
    label: "Broker",
    description: "Real estate professional", 
    icon: Briefcase,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    activeColor: "bg-purple-500 text-white border-purple-500"
  }
};

export function RoleSwitcher() {
  const { user } = useAuth();
  const { switchRole, isUpdating, currentRole } = useRoleSwitch();

  if (!user) return null;

  const currentRoleConfig = roleConfig[currentRole as keyof typeof roleConfig];
  const CurrentIcon = currentRoleConfig.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-2 hover:bg-gray-50"
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CurrentIcon className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{currentRoleConfig.label}</span>
          <Badge 
            variant="secondary" 
            className={`text-xs ${currentRoleConfig.color} border`}
          >
            {currentRoleConfig.label}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(roleConfig).map(([roleKey, roleInfo]) => {
          const Icon = roleInfo.icon;
          const isActive = currentRole === roleKey;
          
          return (
            <DropdownMenuItem
              key={roleKey}
              onClick={() => switchRole(roleKey as "buyer" | "seller" | "broker")}
              className="flex items-center justify-between cursor-pointer"
              disabled={isUpdating}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{roleInfo.label}</span>
                  <span className="text-xs text-gray-500">{roleInfo.description}</span>
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 text-green-600" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 