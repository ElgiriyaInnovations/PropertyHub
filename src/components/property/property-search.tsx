import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Home, Bed, Handshake } from "lucide-react";

interface SearchFilters {
  location: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
  needsBrokerServices: boolean;
}

// Helper functions defined outside component
const getPriceRangeFromParams = (searchParams: URLSearchParams): string | null => {
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  
  if (!minPrice && !maxPrice) return null;
  
  const min = minPrice ? parseInt(minPrice) : null;
  const max = maxPrice ? parseInt(maxPrice) : null;
  
  if (!min && max === 20000000) return "under-200k";
  if (min === 20000000 && max === 40000000) return "200k-400k";
  if (min === 40000000 && max === 60000000) return "400k-600k";
  if (min === 60000000 && max === 80000000) return "600k-800k";
  if (min === 80000000 && max === 100000000) return "800k-1m";
  if (min === 100000000 && !max) return "over-1m";
  
  return null;
};

export default function PropertySearch() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentRole } = useRoleSwitch();
  
  // Initialize filters from URL parameters to persist state
  const initializeFilters = (): SearchFilters => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      location: searchParams.get('city') || searchParams.get('state') || "",
      propertyType: searchParams.get('propertyType') || "all",
      priceRange: getPriceRangeFromParams(searchParams) || "any",
      bedrooms: searchParams.get('minBedrooms') || "any",
      needsBrokerServices: searchParams.get('needsBrokerServices') === 'true',
    };
  };
  
  const [filters, setFilters] = useState<SearchFilters>(() => initializeFilters());

  const handleSearch = () => {
    const searchParams = new URLSearchParams();
    
    console.log("Search triggered with filters:", filters);
    
    // Location - search in both city and state
    if (filters.location && filters.location.trim()) {
      const locationValue = filters.location.trim();
      searchParams.set("city", locationValue);
      searchParams.set("state", locationValue);
      console.log("Adding location filter:", locationValue);
    }
    
    // Property type
    if (filters.propertyType && filters.propertyType.trim() && filters.propertyType !== "all") {
      searchParams.set("propertyType", filters.propertyType);
      console.log("Adding propertyType filter:", filters.propertyType);
    }
    
    // Price range
    if (filters.priceRange && filters.priceRange.trim() && filters.priceRange !== "any") {
      const [min, max] = getPriceRange(filters.priceRange);
      if (min) {
        searchParams.set("minPrice", min.toString());
        console.log("Adding minPrice filter:", min);
      }
      if (max) {
        searchParams.set("maxPrice", max.toString());
        console.log("Adding maxPrice filter:", max);
      }
    }
    
    // Bedrooms
    if (filters.bedrooms && filters.bedrooms.trim() && filters.bedrooms !== "any") {
      searchParams.set("minBedrooms", filters.bedrooms);
      console.log("Adding minBedrooms filter:", filters.bedrooms);
    }
    
    // Broker Services (for buyers who want to see properties needing broker services)
    if (currentRole === 'buyer' && filters.needsBrokerServices) {
      searchParams.set("needsBrokerServices", "true");
      console.log("Adding needsBrokerServices filter: true");
    }

    console.log("Final search params:", Object.fromEntries(searchParams));
    const queryString = searchParams.toString();
    console.log("Navigating to:", `/properties${queryString ? `?${queryString}` : ""}`);
    router.push(`/properties${queryString ? `?${queryString}` : ""}`);
  };

  const getPriceRange = (range: string): [number | null, number | null] => {
    switch (range) {
      case "under-200k":
        return [null, 20000000];
      case "200k-400k":
        return [20000000, 40000000];
      case "400k-600k":
        return [40000000, 60000000];
      case "600k-800k":
        return [60000000, 80000000];
      case "800k-1m":
        return [80000000, 100000000];
      case "over-1m":
        return [100000000, null];
      default:
        return [null, null];
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-neutral-200">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          <Input
            placeholder="City or State"
            value={filters.location}
            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            onKeyPress={handleKeyPress}
            className="border-neutral-300 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
          />
        </div>

        {/* Property Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
            <Home className="h-4 w-4" />
            Property Type
          </label>
          <Select value={filters.propertyType} onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value }))}>
            <SelectTrigger className="border-neutral-300 focus:border-blue-500 text-gray-900">
              <SelectValue placeholder="All Types" className="text-gray-500" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="land">Land</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
            <span className="text-sm font-bold">LKR</span>
            Price Range
          </label>
          <Select value={filters.priceRange} onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}>
            <SelectTrigger className="border-neutral-300 focus:border-blue-500 text-gray-900">
              <SelectValue placeholder="Any Price" className="text-gray-500" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Price</SelectItem>
              <SelectItem value="under-200k">Under LKR 20M</SelectItem>
              <SelectItem value="200k-400k">LKR 20M - 40M</SelectItem>
              <SelectItem value="400k-600k">LKR 40M - 60M</SelectItem>
              <SelectItem value="600k-800k">LKR 60M - 80M</SelectItem>
              <SelectItem value="800k-1m">LKR 80M - 100M</SelectItem>
              <SelectItem value="over-1m">Over LKR 100M</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bedrooms */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
            <Bed className="h-4 w-4" />
            Bedrooms
          </label>
          <Select value={filters.bedrooms} onValueChange={(value) => setFilters(prev => ({ ...prev, bedrooms: value }))}>
            <SelectTrigger className="border-neutral-300 focus:border-blue-500">
              <SelectValue placeholder="Any Bedrooms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Bedrooms</SelectItem>
              <SelectItem value="1">1+ Bedroom</SelectItem>
              <SelectItem value="2">2+ Bedrooms</SelectItem>
              <SelectItem value="3">3+ Bedrooms</SelectItem>
              <SelectItem value="4">4+ Bedrooms</SelectItem>
              <SelectItem value="5">5+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Search Button */}
        <Button onClick={handleSearch} className="h-10 bg-blue-600 hover:bg-blue-700 text-white">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      {/* Broker Services Filter - Only show for buyers (brokers see filtered results automatically) */}
      {currentRole === 'buyer' && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="broker-services-filter"
              checked={filters.needsBrokerServices}
              onCheckedChange={(checked) => setFilters(prev => ({ ...prev, needsBrokerServices: checked as boolean }))}
            />
            <Label htmlFor="broker-services-filter" className="text-sm font-medium text-neutral-700 flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              Show only properties that need broker services
            </Label>
          </div>
          <p className="text-xs text-neutral-500 mt-1 ml-6">
            Find properties where sellers are looking for professional broker assistance
          </p>
        </div>
      )}
    </div>
  );
}