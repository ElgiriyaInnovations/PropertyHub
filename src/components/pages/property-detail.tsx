import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  MessageSquare, 
  Phone, 
  Mail, 
  Share2,
  Calendar,
  User,
  Building2
} from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";

export default function PropertyDetail() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const propertyId = params.id as string;

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
    queryKey: ["/api/properties", propertyId],
    queryFn: () => apiRequest(`/api/properties/${propertyId}`),
    enabled: !!propertyId,
  });

  const { data: favoriteStatus } = useQuery({
    queryKey: ["/api/favorites", propertyId],
    queryFn: async () => {
      if (!isAuthenticated || currentRole !== "buyer") return { isFavorited: false };
      const response = await fetch(`/api/favorites/${propertyId}`, {
        credentials: 'include',
      });
      if (!response.ok) return { isFavorited: false };
      return response.json();
    },
    enabled: isAuthenticated && currentRole === "buyer",
  });

  // Update isFavorite state when favoriteStatus changes
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorite(favoriteStatus.isFavorited);
    }
  }, [favoriteStatus]);

  const favoriteMutation = useMutation({
    mutationFn: async (action: 'add' | 'remove') => {
      const endpoint = `/api/favorites/${propertyId}`;
      const method = action === 'add' ? 'POST' : 'DELETE';
      
      return apiRequest(endpoint, {
        method,
      });
    },
    onSuccess: (_, action) => {
      setIsFavorite(action === 'add');
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", propertyId] });
      
      toast({
        title: action === 'add' ? "Added to Favorites" : "Removed from Favorites",
        description: action === 'add' 
          ? "Property has been added to your favorites"
          : "Property has been removed from your favorites",
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
      return apiRequest('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          participantId: property.ownerId,
          propertyId: property.id,
        }),
      });
    },
    onSuccess: async (response) => {
      const conversation = await response.json();
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
    if (currentRole !== "buyer") {
      toast({
        title: "Feature Unavailable",
        description: "Favorites are only available for buyers",
        variant: "destructive",
      });
      return;
    }
    
    favoriteMutation.mutate(isFavorite ? 'remove' : 'add');
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "sold":
        return "bg-red-100 text-red-800";
      case "rented":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading || propertyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
              <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => router.push('/properties')}>
                Browse Properties
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Role Badge */}
        <div className="mb-4">
          <RoleBadge key={currentRole} />
        </div>

        {/* Property Images */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Image */}
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[selectedImage]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-gray-400 text-center">
                      <div className="text-6xl mb-4">🏠</div>
                      <div className="text-lg">No Image Available</div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Images */}
              {property.images && property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-video rounded-md overflow-hidden border-2 transition-colors ${
                        selectedImage === index 
                          ? 'border-blue-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${property.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                    {isFavorite && currentRole === "buyer" && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 font-medium shadow-md">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Favorited
                      </Badge>
                    )}
                  </div>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status === 'active' ? 'For Sale' : property.status}
                  </Badge>
                </div>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                </div>
                <div className="text-3xl font-bold text-green-600 mb-4">
                  {formatPrice(property.price)}
                </div>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-3 gap-4">
                {property.bedrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm text-gray-600">{property.bedrooms} Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm text-gray-600">{property.bathrooms} Bathrooms</div>
                  </div>
                )}
                {property.squareFeet && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                    <div className="text-sm text-gray-600">{property.squareFeet} sq ft</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {currentRole === "buyer" && (
                  <Button
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                    variant={isFavorite ? "default" : "outline"}
                    className={`flex-1 transition-all duration-300 ${
                      isFavorite 
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md' 
                        : 'hover:border-red-300 hover:text-red-600'
                    }`}
                  >
                    {favoriteMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Heart className={`h-4 w-4 mr-2 transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`} />
                        <span className="font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                      </>
                    )}
                  </Button>
                )}
                
                {property.ownerId !== user?.id && (
                  <Button
                    onClick={handleContact}
                    disabled={contactMutation.isPending}
                    className="flex-1"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {contactMutation.isPending ? 'Starting...' : 'Contact Owner'}
                  </Button>
                )}
                
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Property Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </CardContent>
        </Card>

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property Owner */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Property Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={property.owner?.profileImageUrl} />
                <AvatarFallback className="text-lg">
                  {property.owner?.firstName?.[0]}{property.owner?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {property.owner?.firstName} {property.owner?.lastName}
                </h3>
                <p className="text-gray-600">{property.owner?.email}</p>
                {property.owner?.phone && (
                  <p className="text-gray-600">{property.owner.phone}</p>
                )}
              </div>
              {property.ownerId !== user?.id && (
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium">{property.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className={getStatusColor(property.status)}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listed</span>
                  <span className="font-medium">
                    {property.createdAt ? new Date(property.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-right">{property.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City</span>
                  <span className="font-medium">{property.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State</span>
                  <span className="font-medium">{property.state}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
