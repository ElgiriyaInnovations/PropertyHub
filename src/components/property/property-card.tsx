import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Square, Star, MessageSquare, Phone, Mail, Handshake } from "lucide-react";
import Link from "next/link";
import type { Property } from "@/types/property";

interface PropertyCardProps {
  property: Property;
  showFavorite?: boolean;
  showActions?: boolean;
  className?: string;
}

export default function PropertyCard({ 
  property, 
  showFavorite = true, 
  showActions = true,
  className = "" 
}: PropertyCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { currentRole } = useRoleSwitch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if this property is favorited by the current user
  const { data: favoriteStatus } = useQuery({
    queryKey: ["/api/favorites", property.id],
    queryFn: async () => {
      if (!isAuthenticated || currentRole !== "buyer") return { isFavorited: false };
      const response = await fetch(`/api/favorites/${property.id}`, {
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

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = `/api/favorites/${property.id}`;
      const method = isFavorite ? 'DELETE' : 'POST';
      
      return apiRequest(endpoint, {
        method,
      });
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", property.id] });
      
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: isFavorite 
          ? `${property.title} has been removed from your favorites`
          : `${property.title} has been added to your favorites`,
      });
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please log in to save properties to your favorites",
        variant: "destructive",
      });
      return;
    }

    if (currentRole !== "buyer") {
      toast({
        title: "Feature Unavailable",
        description: "Favorites are only available for buyers",
        variant: "destructive",
      });
      return;
    }

    // Add a small delay to show the loading state
    toggleFavoriteMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'house':
        return 'bg-blue-100 text-blue-800';
      case 'apartment':
        return 'bg-green-100 text-green-800';
      case 'condo':
        return 'bg-purple-100 text-purple-800';
      case 'townhouse':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          {/* Property Image */}
          <div className="aspect-video bg-gray-200 relative overflow-hidden">
            {/* Favorite Overlay - Show when favorited */}
            {isFavorite && showFavorite && currentRole === "buyer" && (
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent pointer-events-none z-10" />
            )}
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-gray-400 text-center">
                  <div className="text-4xl mb-2">🏠</div>
                  <div className="text-sm">No Image</div>
                </div>
              </div>
            )}
            
            {/* Enhanced Favorite Button */}
            {showFavorite && currentRole === "buyer" && (
              <button
                onClick={handleFavoriteClick}
                className={`absolute top-3 right-3 p-2.5 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
                    : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500 border border-gray-200/50'
                } ${toggleFavoriteMutation.isPending ? 'animate-pulse' : ''}`}
                disabled={toggleFavoriteMutation.isPending}
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {toggleFavoriteMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-current scale-110' : 'hover:scale-110'}`} />
                )}
              </button>
            )}

            {/* Property Type Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={getPropertyTypeColor(property.propertyType)}>
                {property.propertyType}
              </Badge>
            </div>

            {/* Broker Service Status Badge - Only show for sellers viewing their own properties */}
            {currentRole === 'seller' && property.needsBrokerServices && (
              <div className="absolute top-12 left-3">
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1">
                  <Handshake className="h-3 w-3" />
                  <span className="text-xs">Needs Broker</span>
                </Badge>
              </div>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-white text-green-600 border-green-200 font-semibold">
                {formatPrice(property.price)}
              </Badge>
            </div>

            {/* Favorited Badge - Show when favorited */}
            {isFavorite && showFavorite && currentRole === "buyer" && (
              <div className="absolute bottom-3 right-3">
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 font-medium shadow-md">
                  <Heart className="h-3 w-3 mr-1 fill-current" />
                  Favorited
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        {/* Property Title and Location */}
        <div className="mb-3">
          <Link href={`/properties/${property.id}`}>
            <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors mb-1">
              {property.title}
            </h3>
          </Link>
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{property.address}, {property.city}, {property.state}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} beds</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms} baths</span>
              </div>
            )}
            {property.squareFeet && (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{property.squareFeet} sq ft</span>
              </div>
            )}
          </div>
        </div>

        {/* Property Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>

        {/* Broker Service Status - Only show for sellers viewing their own properties */}
        {currentRole === 'seller' && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                property.needsBrokerServices 
                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <Handshake className="h-3 w-3" />
                <span>
                  {property.needsBrokerServices ? 'Needs Broker Services' : 'No Broker Services Needed'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {property.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{property.amenities.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Contact Information - Show for buyers and brokers */}
        {(currentRole === "buyer" || currentRole === "broker") && property.owner && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Contact Information
            </h4>
            <div className="space-y-1 text-sm">
              {property.owner.firstName && property.owner.lastName && (
                <div className="text-gray-700">
                  <span className="font-medium">Owner:</span> {property.owner.firstName} {property.owner.lastName}
                </div>
              )}
              {property.owner.email && (
                <div className="text-gray-700 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <a 
                    href={`mailto:${property.owner.email}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {property.owner.email}
                  </a>
                </div>
              )}
              {property.owner.phone && (
                <div className="text-gray-700 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <a 
                    href={`tel:${property.owner.phone}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {property.owner.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <Link href={`/properties/${property.id}`} className="flex-1">
              <Button className="w-full" size="sm">
                View Details
              </Button>
            </Link>
            
            {showFavorite && currentRole === "buyer" && (
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={handleFavoriteClick}
                disabled={toggleFavoriteMutation.isPending}
                className={`flex items-center gap-2 transition-all duration-300 ${
                  isFavorite 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md' 
                    : 'hover:border-red-300 hover:text-red-600'
                }`}
              >
                {toggleFavoriteMutation.isPending ? (
                  <>
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Heart className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="font-medium">{isFavorite ? 'Saved' : 'Save'}</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
