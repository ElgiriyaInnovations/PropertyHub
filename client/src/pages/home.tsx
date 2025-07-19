import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import type { Property } from "@shared/schema";
import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";
import PropertyCard from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Home as HomeIcon, Search, Plus, ArrowRight } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            {/* Role Badge */}
            <div className="mb-6">
              <Badge 
                variant="secondary" 
                className={`text-sm px-4 py-2 ${
                  user?.role === 'buyer' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  user?.role === 'seller' ? 'bg-green-100 text-green-800 border-green-200' :
                  'bg-purple-100 text-purple-800 border-purple-200'
                }`}
              >
                {user?.role === 'buyer' && '🏠 Buyer'}
                {user?.role === 'seller' && '📋 Seller'}
                {user?.role === 'broker' && '👔 Broker'}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome back, {user?.firstName || user?.email}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {user?.role === 'buyer' && "Discover your perfect home with our curated selection"}
              {user?.role === 'seller' && "Manage your properties and connect with buyers"}
              {user?.role === 'broker' && "Connect with clients and grow your business"}
            </p>
          </div>
          
          {/* Main Action Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user?.role === 'buyer' && (
              <Link href="/properties">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Browse Properties
                </Button>
              </Link>
            )}
            {(user?.role === 'seller' || user?.role === 'broker') && (
              <Link href="/add-property">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Property
                </Button>
              </Link>
            )}
            <Link href="/properties">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                View All
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties - Minimal */}
      {featuredProperties && featuredProperties.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {user?.role === 'buyer' ? 'Featured Properties' : 'Recent Listings'}
              </h2>
              <p className="text-gray-600">
                {user?.role === 'buyer' ? 'Handpicked for you' : 'Your latest additions'}
              </p>
            </div>

            {propertiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {featuredProperties.slice(0, 2).map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Navigation */}
      <section className="py-12 px-4 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/properties">
              <Button variant="ghost" className="w-full h-16 flex flex-col gap-2 hover:bg-gray-50">
                <HomeIcon className="h-6 w-6 text-blue-600" />
                <span className="text-sm">Properties</span>
              </Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="w-full h-16 flex flex-col gap-2 hover:bg-gray-50">
                <div className="h-6 w-6 text-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm">Messages</span>
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full h-16 flex flex-col gap-2 hover:bg-gray-50">
                <div className="h-6 w-6 text-blue-600 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span className="text-sm">Profile</span>
              </Button>
            </Link>
            {(user?.role === 'seller' || user?.role === 'broker') && (
              <Link href="/add-property">
                <Button variant="ghost" className="w-full h-16 flex flex-col gap-2 hover:bg-gray-50">
                  <Plus className="h-6 w-6 text-blue-600" />
                  <span className="text-sm">Add New</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
