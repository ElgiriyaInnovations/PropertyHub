import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/header";
import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import PropertySearch from "@/components/property/property-search";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";
import { LandingImage } from "@/components/ui/landing-image";

export default function Properties() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { currentRole } = useRoleSwitch();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Build filters object from URL parameters
  const urlFilters: Record<string, string> = {};
  
  // Get all parameters from search params
  searchParams.forEach((value, key) => {
    if (value && value.trim()) {
      urlFilters[key] = value.trim();
    }
  });
  
  // Always include status filter
  urlFilters.status = 'active';
  
  // If user is in seller mode, only show their properties
  if (currentRole === 'seller' && user?.id) {
    urlFilters.ownerId = user.id;
    console.log("Seller mode: filtering by owner ID:", user.id);
    console.log("Current user object:", user);
  } 
  // If user is in broker mode, only show properties that need broker services
  else if (currentRole === 'broker') {
    urlFilters.needsBrokerServices = 'true';
    console.log("Broker mode: filtering by needsBrokerServices: true");
  }
  else {
    console.log("Not in seller mode or no user ID. Current role:", currentRole, "User ID:", user?.id);
  }
  
  console.log("Properties page - final filters to send:", urlFilters);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: properties, isLoading: propertiesLoading, error } = useQuery({
    queryKey: ["/api/properties", urlFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(urlFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/properties?${params.toString()}`, {
        credentials: 'include', // Include cookies for authentication
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    retry: false,
    refetchOnWindowFocus: false, // Prevent auto-refetch on focus
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/auth";
      }, 500);
    }
  }, [error, toast]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Search */}
      <section className="bg-white shadow-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LandingImage
            title={
              currentRole === 'seller' ? "My Property Listings" : 
              currentRole === 'broker' ? "Properties Needing Broker Services" :
              "Find Your Perfect Property"
            }
            subtitle={
              currentRole === 'seller' 
                ? "Manage and view all your property listings" 
                : currentRole === 'broker'
                ? "Connect with sellers who need professional broker assistance"
                : "Discover properties that match your lifestyle and budget"
            }
            role={currentRole}
            showBackground={false}
            className="py-8"
          />
          
          {/* Only show search for buyers, not for sellers or brokers viewing filtered properties */}
          {currentRole === 'buyer' && <PropertySearch />}
        </div>
      </section>

      {/* Filters and Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-600">
                  {currentRole === 'seller' 
                    ? `${Array.isArray(properties) ? properties.length : 0} of your properties listed`
                    : currentRole === 'broker'
                    ? `${Array.isArray(properties) ? properties.length : 0} properties needing broker services`
                    : `${Array.isArray(properties) ? properties.length : 0} properties found`
                  }
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Add Property button for sellers */}
                {currentRole === 'seller' && (
                  <Button
                    onClick={() => window.location.href = '/add-property'}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    + Add Property
                  </Button>
                )}
                
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results */}
          {propertiesLoading ? (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-neutral-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : Array.isArray(properties) && properties.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">
                {currentRole === 'seller' ? 'No properties listed yet' : 
                 currentRole === 'broker' ? 'No properties needing broker services' :
                 'No properties found'}
              </h3>
              <p className="text-neutral-500 mb-6">
                {currentRole === 'seller' 
                  ? 'Start by adding your first property listing to attract potential buyers.'
                  : currentRole === 'broker'
                  ? 'Currently no properties are requesting broker services. Check back later for new opportunities.'
                  : 'Try adjusting your search criteria to find more properties.'
                }
              </p>
              {currentRole === 'seller' && (
                <Button 
                  onClick={() => window.location.href = '/add-property'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Your First Property
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
