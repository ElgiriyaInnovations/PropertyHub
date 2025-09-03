"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/role-badge";
import { LandingImage } from "@/components/ui/landing-image";
import AuthHeader from "@/components/layout/auth-header";
import { 
  Search, 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  MessageSquare,
  Filter,
  Users,
  Award,
  Calendar,
  Loader2
} from "lucide-react";

// Broker type definition
interface Broker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  specialties: string[];
  rating: number;
  totalSales: number;
  profileImage: string | null;
  bio: string;
  languages: string[];
  certifications: string[];
}

export default function BrokerRegistry() {
  const { user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  // Fetch brokers from API
  const { data: brokers = [], isLoading, error } = useQuery<Broker[]>({
    queryKey: ["/api/brokers", searchTerm, selectedLocation, selectedSpecialty],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedLocation) params.append("location", selectedLocation);
      if (selectedSpecialty) params.append("specialty", selectedSpecialty);
      
      const response = await fetch(`/api/brokers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch brokers");
      }
      return response.json();
    },
    retry: false,
  });

  // Get unique locations and specialties from the fetched data
  const locations = Array.from(new Set(brokers.map(broker => broker.location)));
  const specialties = Array.from(new Set(brokers.flatMap(broker => broker.specialties)));

  const handleContactBroker = (broker: Broker) => {
    // In a real app, this would open a messaging interface or contact form
    console.log("Contacting broker:", broker);
    // You could implement a modal or redirect to messaging
  };

  if (currentRole !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
              <p className="text-gray-600 mb-6">The broker registry is only available for sellers.</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex justify-center mb-3">
            <RoleBadge key={currentRole} />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Broker Registry</h1>
          <p className="text-lg text-neutral-600">Find and connect with professional real estate brokers</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Find Your Perfect Broker
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name or Location
                </label>
                <Input
                  placeholder="Search brokers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialty
                </label>
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Specialties</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>{specialty}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading brokers...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Brokers</h3>
              <p className="text-gray-600 mb-4">Failed to load broker data. Please try again later.</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Brokers Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brokers.map((broker) => (
            <Card key={broker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={broker.profileImage || undefined} />
                      <AvatarFallback>
                        {broker.firstName[0]}{broker.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {broker.firstName} {broker.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {broker.location}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{broker.rating}</span>
                    </div>
                    <p className="text-sm text-gray-600">{broker.experience}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 text-sm">{broker.bio}</p>
                
                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {broker.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Languages:</h4>
                  <p className="text-sm text-gray-600">{broker.languages.join(", ")}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm mb-2">Certifications:</h4>
                  <div className="flex flex-wrap gap-1">
                    {broker.certifications.map((cert) => (
                      <Badge key={cert} variant="outline" className="text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {broker.totalSales} sales
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {broker.experience}
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => handleContactBroker(broker)}
                    className="w-full"
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Broker
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!isLoading && !error && brokers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No brokers found</h3>
              <p className="text-gray-600">Try adjusting your search criteria to find more brokers.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
