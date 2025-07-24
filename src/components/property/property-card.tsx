import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Square, Star, MessageSquare, Phone, Mail } from "lucide-react";
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
  const [isFavorite, setIsFavorite] = useState(property.isFavorite || false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isFavorite ? `/api/favorites/${property.id}` : '/api/favorites';
      const method = isFavorite ? 'DELETE' : 'POST';
      const body = isFavorite ? undefined : JSON.stringify({ propertyId: property.id });
      
      return apiRequest(endpoint, {
        method,
        body,
      });
    },
    onSuccess: () => {
      setIsFavorite(!isFavorite);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
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

    toggleFavoriteMutation.mutate();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
            
            {/* Favorite Button */}
            {showFavorite && currentRole === "buyer" && (
              <button
                onClick={handleFavoriteClick}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                disabled={toggleFavoriteMutation.isPending}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Property Type Badge */}
            <div className="absolute top-3 left-3">
              <Badge className={getPropertyTypeColor(property.propertyType)}>
                {property.propertyType}
              </Badge>
            </div>

            {/* Price Badge */}
            <div className="absolute bottom-3 left-3">
              <Badge className="bg-white text-green-600 border-green-200 font-semibold">
                {formatPrice(property.price)}
              </Badge>
            </div>
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
                variant="outline"
                size="sm"
                onClick={handleFavoriteClick}
                disabled={toggleFavoriteMutation.isPending}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                {isFavorite ? 'Saved' : 'Save'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
