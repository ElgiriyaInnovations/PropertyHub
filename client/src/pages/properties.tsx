import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import PropertySearch from "@/components/property/property-search";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Grid, List } from "lucide-react";

export default function Properties() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Use window.location.search to get actual URL parameters
  const actualSearchParams = new URLSearchParams(window.location.search);

  // Parse URL parameters for filters
  console.log("Properties page - wouter location:", location);
  console.log("Properties page - window.location.search:", window.location.search);
  console.log("Properties page - window.location.href:", window.location.href);
  
  // Use actualSearchParams which gets parameters from window.location.search
  console.log("Properties page - actual search params:", Object.fromEntries(actualSearchParams));
  
  // Build filters object from URL parameters
  const urlFilters: Record<string, string> = {};
  
  // Get all parameters from actual URL
  for (const [key, value] of actualSearchParams.entries()) {
    if (value && value.trim()) {
      urlFilters[key] = value.trim();
    }
  }
  
  // Always include status filter
  urlFilters.status = 'active';
  
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
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: properties, isLoading: propertiesLoading, error } = useQuery({
    queryKey: ["/api/properties", urlFilters],
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
        window.location.href = "/api/login";
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
      <section className="bg-white shadow-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">Find Your Perfect Property</h1>
            <p className="text-lg text-neutral-600">Discover properties that match your lifestyle and budget</p>
          </div>
          
          <PropertySearch />
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
                  {properties?.length || 0} properties found
                </span>
              </div>
              
              <div className="flex items-center gap-2">
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
          ) : properties && properties.length > 0 ? (
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {properties.map((property: any) => (
                <PropertyCard key={property.id} property={property} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Filter className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-600 mb-2">No properties found</h3>
              <p className="text-neutral-500 mb-6">
                Try adjusting your search criteria to find more properties.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
