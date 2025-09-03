import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "@/types/property";
import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Home as HomeIcon, Search, Plus, ArrowRight } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { LandingImage } from "@/components/ui/landing-image";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentRole } = useRoleSwitch();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: featuredProperties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", { limit: 2 }],
    queryFn: async () => {
      const response = await fetch('/api/properties?limit=2', {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <AuthHeader />
      
      {/* Hero Section */}
      <LandingImage
        title={`Welcome back, ${user?.firstName || user?.email}`}
        subtitle={
          currentRole === 'buyer' ? "Discover your perfect home with our curated selection" :
          currentRole === 'seller' ? "Manage your properties and connect with buyers" :
          currentRole === 'broker' ? "Connect with clients and grow your business" :
          "Welcome to PropertyHub"
        }
        role={currentRole}
        showBackground={false}
        className="py-12"
      />
      
      {/* Action Buttons */}
      <section className="py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentRole === 'buyer' && (
              <Link href="/properties">
                <Button size="lg" className="w-full sm:w-auto">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
            )}
            {(currentRole === 'seller' || currentRole === 'broker') && (
              <Link href="/add-property">
                <Button size="lg" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Property
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {currentRole === 'buyer' ? 'Featured Properties' : 'Recent Listings'}
            </h2>
            <p className="text-lg text-gray-600">
              {currentRole === 'buyer' ? 'Handpicked for you' : 'Your latest additions'}
            </p>
          </div>

          {propertiesLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : featuredProperties && featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <HomeIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6">
                {currentRole === 'buyer' 
                  ? "We're working on adding more properties for you."
                  : "Start by adding your first property listing."
                }
              </p>
              {currentRole === 'buyer' ? (
                <Link href="/properties">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Browse All Properties
                  </Button>
                </Link>
              ) : (
                <Link href="/add-property">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </Link>
              )}
            </div>
          )}

          {(currentRole === 'seller' || currentRole === 'broker') && (
            <div className="text-center mt-12">
              <Link href="/add-property">
                <Button variant="outline" size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add More Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
