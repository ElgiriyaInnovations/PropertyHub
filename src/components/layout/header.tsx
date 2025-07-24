import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  Search, 
  Plus, 
  MessageSquare, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Loader2
} from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { switchRole, isUpdating, currentRole } = useRoleSwitch();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: unreadCount } = useQuery<number>({
    queryKey: ["/api/conversations/unread-count"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/properties", label: "Properties", icon: Search },
  ];

  // Add role-specific nav items
  if (currentRole === "seller" || currentRole === "broker") {
    navItems.push({ href: "/add-property", label: "Add Property", icon: Plus });
  }

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Home className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-primary">PropertyHub</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-blue-50"
                      : "text-neutral-800 hover:text-primary hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Actions */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Messages */}
              <Link href="/messages">
                <div className="relative">
                  <Button variant="ghost" size="sm" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {unreadCount && unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </Link>

              {/* Role Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <span className="text-sm">
                      {currentRole === 'buyer' && '🏠'}
                      {currentRole === 'seller' && '📋'}
                      {currentRole === 'broker' && '👔'}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium capitalize">
                      {currentRole}
                    </span>
                    {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {["buyer", "seller", "broker"].map((role) => {
                    const isActive = currentRole === role;
                    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
                    const roleIcons = {
                      buyer: "🏠",
                      seller: "📋", 
                      broker: "👔"
                    };
                    return (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => {
                          if (currentRole !== role) {
                            switchRole(role as "buyer" | "seller" | "broker");
                          }
                        }}
                        disabled={isUpdating}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{roleIcons[role as keyof typeof roleIcons]}</span>
                          <span>{roleLabel}</span>
                        </div>
                        {isActive && <span className="text-xs text-green-600 font-medium">Active</span>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-neutral-800">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-neutral-600 capitalize">{currentRole}</span>
                        <span className="text-xs">
                          {currentRole === 'buyer' && '🏠'}
                          {currentRole === 'seller' && '📋'}
                          {currentRole === 'broker' && '👔'}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-neutral-600">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-neutral-200 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-primary bg-blue-50"
                      : "text-neutral-800 hover:text-primary hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {isAuthenticated && (
              <div className="border-t border-neutral-200 pt-4 mt-4">
                {/* Role Switcher for Mobile */}
                <div className="px-3 py-2 border-b border-neutral-200 pb-4 mb-4">
                  <div className="text-sm font-medium text-neutral-700 mb-3">Switch Role</div>
                  <div className="space-y-2">
                    {["buyer", "seller", "broker"].map((role) => {
                      const isActive = currentRole === role;
                      const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
                      const roleIcons = {
                        buyer: "🏠",
                        seller: "📋", 
                        broker: "👔"
                      };
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            if (currentRole !== role) {
                              switchRole(role as "buyer" | "seller" | "broker");
                            }
                            setMobileMenuOpen(false);
                          }}
                          disabled={isUpdating}
                          className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-blue-500 text-white shadow-md"
                              : "text-neutral-800 hover:bg-blue-50 hover:text-blue-600 border border-gray-200"
                          } ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{roleIcons[role as keyof typeof roleIcons]}</span>
                            <span>{roleLabel}</span>
                          </div>
                          {isActive && <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Active</span>}
                          {isUpdating && currentRole !== role && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <Link 
                  href="/messages"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-neutral-800 hover:text-primary hover:bg-neutral-50"
                >
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </div>
                  {unreadCount && unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Badge>
                  )}
                </Link>
                
                <Link 
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-800 hover:text-primary hover:bg-neutral-50"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
