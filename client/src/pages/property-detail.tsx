import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  Share2, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  ArrowLeft,
  Camera,
  MapIcon
} from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";

export default function PropertyDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

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

  const { data: property, isLoading: propertyLoading, error } = useQuery({
    queryKey: [`/api/properties/${id}`],
    enabled: !!id && isAuthenticated,
    retry: false,
  });

  const { data: favorites } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated && user?.role === "buyer",
    retry: false,
  });

  useEffect(() => {
    if (favorites && property) {
      setIsFavorited(favorites.some((fav: any) => fav.id === property.id));
    }
  }, [favorites, property]);

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

  const favoriteMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      if (action === 'add') {
        return apiRequest('POST', `/api/favorites/${property.id}`);
      } else {
        return apiRequest('DELETE', `/api/favorites/${property.id}`);
      }
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? "Property removed from your favorites" : "Property added to your favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    },
  });

  const contactMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', `/api/conversations`, {
        participantId: property.ownerId,
        propertyId: property.id,
      });
    },
    onSuccess: (response) => {
      const conversation = response.json();
      window.location.href = `/messages?conversation=${conversation.id}`;
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const handleFavorite = () => {
    if (user?.role !== "buyer") {
      toast({
        title: "Access Denied",
        description: "Only buyers can save favorites",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate(isFavorited ? 'remove' : 'add');
  };

  const handleContact = () => {
    if (property.ownerId === user?.id) {
      toast({
        title: "Cannot Contact",
        description: "You cannot contact yourself",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this property: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Property link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (propertyLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-neutral-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                <div className="h-6 bg-neutral-200 rounded mb-8"></div>
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-neutral-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div>
                <div className="h-64 bg-neutral-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">Property Not Found</h1>
            <p className="text-neutral-600 mb-8">The property you're looking for doesn't exist or has been removed.</p>
            <Link href="/properties">
              <Button>Back to Properties</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = property.images && property.images.length > 0 
    ? property.images 
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/properties">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Properties
            </Button>
          </Link>
        </div>

        {/* Role Badge */}
        <div className="flex justify-center mb-6">
          <RoleBadge key={user?.role} />
        </div>

        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative">
            <img
              src={images[currentImageIndex]}
              alt={property.title}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  ←
                </button>
                <button
                  onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                >
                  →
                </button>
                
                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 ${
                      index === currentImageIndex ? 'ring-2 ring-primary' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Property Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-800 mb-2">{property.title}</h1>
                  <div className="flex items-center text-neutral-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {user?.role === "buyer" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFavorite}
                      disabled={favoriteMutation.isPending}
                      className={isFavorited ? "text-red-500 border-red-500" : ""}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-primary">
                  ${parseFloat(property.price).toLocaleString()}
                  {property.status === 'rented' && <span className="text-base font-normal">/mo</span>}
                </div>
                <Badge variant={
                  property.status === 'active' ? 'default' :
                  property.status === 'pending' ? 'secondary' :
                  property.status === 'sold' ? 'destructive' : 'outline'
                }>
                  {property.status}
                </Badge>
              </div>

              <div className="flex items-center space-x-8 text-neutral-600 mb-6">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-5 w-5 mr-2" />
                    <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-5 w-5 mr-2" />
                    <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="flex items-center">
                    <Square className="h-5 w-5 mr-2" />
                    <span>{property.squareFeet.toLocaleString()} sq ft</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Description</h2>
              <p className="text-neutral-600 whitespace-pre-wrap">
                {property.description || "No description available."}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <span className="text-secondary mr-2">✓</span>
                      <span className="text-neutral-600">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Details */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-800 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-neutral-800">Property Type:</span>
                  <span className="ml-2 text-neutral-600 capitalize">{property.propertyType}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-800">Status:</span>
                  <span className="ml-2 text-neutral-600 capitalize">{property.status}</span>
                </div>
                <div>
                  <span className="font-medium text-neutral-800">Listed:</span>
                  <span className="ml-2 text-neutral-600">
                    {new Date(property.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {property.updatedAt !== property.createdAt && (
                  <div>
                    <span className="font-medium text-neutral-800">Updated:</span>
                    <span className="ml-2 text-neutral-600">
                      {new Date(property.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Owner/Agent Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="w-16 h-16 mx-auto mb-4">
                    <AvatarImage src="/api/placeholder/64/64" />
                    <AvatarFallback>
                      {property.owner?.firstName?.[0]}{property.owner?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-neutral-800 mb-1">
                    {property.owner?.firstName} {property.owner?.lastName}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 capitalize">
                    {property.owner?.role || 'Property Owner'}
                  </p>

                  {property.ownerId !== user?.id && (
                    <div className="space-y-3">
                      <Button 
                        className="w-full bg-primary hover:bg-blue-700"
                        onClick={handleContact}
                        disabled={contactMutation.isPending}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {contactMutation.isPending ? 'Starting...' : 'Send Message'}
                      </Button>
                      
                      {property.owner?.phone && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`tel:${property.owner.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            Call
                          </a>
                        </Button>
                      )}
                      
                      {property.owner?.email && (
                        <Button variant="outline" className="w-full" asChild>
                          <a href={`mailto:${property.owner.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </a>
                        </Button>
                      )}
                    </div>
                  )}

                  {property.ownerId === user?.id && (
                    <div className="space-y-3">
                      <Link href={`/edit-property/${property.id}`}>
                        <Button className="w-full">
                          Edit Property
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map placeholder */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Location</h3>
                <div className="bg-neutral-100 rounded-lg h-48 flex items-center justify-center">
                  <div className="text-center text-neutral-500">
                    <MapIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Map integration coming soon</p>
                    <p className="text-xs mt-1">{property.city}, {property.state}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-neutral-800 mb-4">Actions</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Property
                  </Button>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`/properties?city=${property.city}&state=${property.state}`}>
                      <MapPin className="h-4 w-4 mr-2" />
                      View Similar Properties
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
