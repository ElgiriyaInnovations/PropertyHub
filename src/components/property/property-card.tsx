import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MapPin, Bed, Bath, Square, MessageSquare } from "lucide-react";

interface PropertyCardProps {
  property: any;
  viewMode?: "grid" | "list";
  showFavorite?: boolean;
}

export default function PropertyCard({ 
  property, 
  viewMode = "grid",
  showFavorite = true 
}: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(false);

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

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-secondary text-white";
      case "pending":
        return "bg-orange-500 text-white";
      case "sold":
        return "bg-red-500 text-white";
      case "rented":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "For Sale";
      case "pending":
        return "Pending";
      case "sold":
        return "Sold";
      case "rented":
        return "For Rent";
      default:
        return status;
    }
  };

  const defaultImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  const propertyImage = property.images && property.images.length > 0 ? property.images[0] : defaultImage;

  if (viewMode === "list") {
    return (
      <Card className="property-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
        <CardContent className="p-0">
          <div className="flex">
            {/* Image */}
            <div className="relative w-64 h-48 flex-shrink-0">
              <Link href={`/property/${property.id}`}>
                <img 
                  src={propertyImage}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="absolute top-4 left-4">
                <Badge className={getStatusColor(property.status)}>
                  {getStatusLabel(property.status)}
                </Badge>
              </div>
              {property.images && property.images.length > 1 && (
                <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/60 text-white">
                  +{property.images.length - 1} more
                </Badge>
              )}
              {showFavorite && user?.role === "buyer" && (
                <div className="absolute top-4 right-4">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full"
                    onClick={handleFavorite}
                    disabled={favoriteMutation.isPending}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-current text-red-500" : "text-neutral-600"}`} />
                  </Button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              <Link href={`/property/${property.id}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-neutral-800">{property.title}</h3>
                  <span className="text-2xl font-bold text-primary">
                    LKR {parseFloat(property.price).toLocaleString()}
                    {property.status === 'rented' && <span className="text-base font-normal">/mo</span>}
                  </span>
                </div>

                <div className="flex items-center text-neutral-600 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{property.address}, {property.city}, {property.state} {property.zipCode}</span>
                </div>

                <div className="flex items-center space-x-6 text-sm text-neutral-600 mb-4">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1" />
                      <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-4 w-4 mr-1" />
                      <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {property.squareFeet && (
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1" />
                      <span>{property.squareFeet.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>

                {property.description && (
                  <p className="text-neutral-600 mb-4 line-clamp-2">{property.description}</p>
                )}
              </Link>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={property.owner?.profileImageUrl} />
                    <AvatarFallback>
                      {property.owner?.firstName?.[0]}{property.owner?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-neutral-800">
                      {property.owner?.firstName} {property.owner?.lastName}
                    </p>
                    <p className="text-xs text-neutral-600 capitalize">{property.owner?.role}</p>
                  </div>
                </div>
                
                {property.ownerId !== user?.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-blue-700"
                    onClick={handleContact}
                    disabled={contactMutation.isPending}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {contactMutation.isPending ? 'Starting...' : 'Contact'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="property-card overflow-hidden hover:shadow-lg transition-all cursor-pointer">
      <div className="relative">
        <Link href={`/property/${property.id}`}>
          <img 
            src={propertyImage}
            alt={property.title}
            className="w-full h-48 object-cover"
          />
        </Link>
        <div className="absolute top-4 left-4">
          <Badge className={getStatusColor(property.status)}>
            {getStatusLabel(property.status)}
          </Badge>
        </div>
        {property.images && property.images.length > 1 && (
          <Badge variant="secondary" className="absolute bottom-2 right-2 bg-black/60 text-white">
            +{property.images.length - 1} more
          </Badge>
        )}
        {showFavorite && user?.role === "buyer" && (
          <div className="absolute top-4 right-4">
            <Button 
              size="sm" 
              variant="ghost" 
              className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full"
              onClick={handleFavorite}
              disabled={favoriteMutation.isPending}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? "fill-current text-red-500" : "text-neutral-600"}`} />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        <Link href={`/property/${property.id}`}>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold text-neutral-800">{property.title}</h3>
            <span className="text-2xl font-bold text-primary">
              LKR {parseFloat(property.price).toLocaleString()}
              {property.status === 'rented' && <span className="text-base font-normal">/mo</span>}
            </span>
          </div>

          <div className="flex items-center text-neutral-600 mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{property.address}, {property.city}, {property.state} {property.zipCode}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-4">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
              </div>
            )}
            {property.squareFeet && (
              <div className="flex items-center">
                <Square className="h-4 w-4 mr-1" />
                <span>{property.squareFeet.toLocaleString()} sq ft</span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={property.owner?.profileImageUrl} />
              <AvatarFallback>
                {property.owner?.firstName?.[0]}{property.owner?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-neutral-800">
              {property.owner?.firstName} {property.owner?.lastName}
            </span>
          </div>
          
          {property.ownerId !== user?.id && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-blue-700"
              onClick={handleContact}
              disabled={contactMutation.isPending}
            >
              {contactMutation.isPending ? 'Starting...' : 'Contact'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
