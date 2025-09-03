import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { RoleSwitcher } from "@/components/ui/role-switcher";
import { Home, LogOut, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthHeader() {
  const { user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const { toast } = useToast();
  const pathname = usePathname();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      localStorage.removeItem('accessToken');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      window.location.reload();
    },
    onError: () => {
      // Clear local storage anyway
      localStorage.removeItem('accessToken');
      window.location.reload();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/assets/prop-logo.jpg" 
              alt="PropertyHub Logo" 
              width={32} 
              height={32} 
              className="mr-2 rounded"
            />
            <h1 className="text-2xl font-bold text-primary">Elgiriya Properties</h1>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {currentRole !== 'seller' && (
              pathname === "/" ? (
                <button 
                  onClick={() => {
                    const propertiesSection = document.getElementById('featured-properties');
                    if (propertiesSection) {
                      propertiesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  Properties
                </button>
              ) : (
                <Link href="/properties" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                  Properties
                </Link>
              )
            )}
            {/* Market Insights hidden for now
            {currentRole === 'buyer' && (
              <Link href="/market-insights" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Market Insights
              </Link>
            )}
            */}
            {currentRole === 'seller' && (
              <Link href="/broker-registry" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
                Broker Registry
              </Link>
            )}
                      {(currentRole === 'seller' || currentRole === 'broker') && (
            <Link href="/add-property" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
              Add Property
            </Link>
          )}
          <Link href="/broker-registration" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            Become a Broker
          </Link>
          <Link href="/messages" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md">
            Messages
          </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <RoleSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.firstName} {user?.lastName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}