import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientPropertySchema } from "@/types/property";
import { z } from "zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, X, Upload, Home, Users } from "lucide-react";
import ImageUpload from "@/components/property/image-upload";
import { RoleBadge } from "@/components/ui/role-badge";

const formSchema = clientPropertySchema.extend({
  price: z.string().min(1, "Price is required"),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  squareFeet: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
  needsBrokerServices: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddProperty() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [needsBrokerServices, setNeedsBrokerServices] = useState<boolean>(false);

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

  // Redirect if user is a buyer (only after role is loaded)
  useEffect(() => {
    if (currentRole && currentRole === "buyer") {
      toast({
        title: "Access Denied",
        description: "Only sellers and brokers can create property listings",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [currentRole, router, toast]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      propertyType: undefined,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      bedrooms: "",
      bathrooms: "",
      squareFeet: "",
      images: [],
      amenities: [],
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('=== MUTATION FUNCTION CALLED ===');
      console.log('Mutation data received:', data);
      try {
        const response = await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for authentication
          body: JSON.stringify(data),
        });

        console.log('Raw response status:', response.status);
        console.log('Raw response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error text:', errorText);
          
          // Check for token expiration
          if (response.status === 401) {
            window.location.href = '/auth';
            return;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log('API request successful, result:', result);
        return result;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    },
    onSuccess: (property) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      
      if (currentRole === "seller" && needsBrokerServices) {
        toast({
          title: "Property Listed with Broker Services",
          description: "Your property has been listed successfully. Our brokers will contact you soon to discuss professional services.",
        });
      } else {
        toast({
          title: "Property Created",
          description: "Your property has been listed successfully",
        });
      }
      
      console.log('Redirecting to property detail page:', `/property/${property.id}`);
              router.push(`/properties/${property.id}`);
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
        description: "Failed to create property listing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('=== FORM SUBMISSION START ===');
    console.log('Raw form data:', data);
    console.log('Image URLs:', imageUrls);
    console.log('Amenities:', amenities);
    console.log('User ID:', user?.id);

    if (imageUrls.length === 0) {
      toast({
        title: "Images Required",
        description: "Please upload at least one property image.",
        variant: "destructive",
      });
      return;
    }

    const propertyData = {
      ...data,
      price: data.price, // Keep as string for validation
      bedrooms: data.bedrooms ? parseInt(data.bedrooms, 10) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms, 10) : null,
      squareFeet: data.squareFeet ? parseInt(data.squareFeet, 10) : null,
      images: imageUrls,
      amenities,
              needsBrokerServices: currentRole === "seller" ? needsBrokerServices : null,
    };

    console.log('Final property data to submit:', propertyData);
    console.log('=== CALLING MUTATION ===');
    createPropertyMutation.mutate(propertyData);
  };



  const addAmenity = () => {
    const trimmedAmenity = amenityInput.trim();
    
    if (!trimmedAmenity) {
      toast({
        title: "Empty Amenity",
        description: "Please enter an amenity name",
        variant: "destructive",
      });
      return;
    }
    
    if (amenities.includes(trimmedAmenity)) {
      toast({
        title: "Duplicate Amenity",
        description: `"${trimmedAmenity}" is already added`,
        variant: "destructive",
      });
      return;
    }
    
    setAmenities(prev => [...prev, trimmedAmenity]);
    setAmenityInput("");
    
    toast({
      title: "Amenity Added",
      description: `"${trimmedAmenity}" has been added to your property`,
    });
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(prev => prev.filter(a => a !== amenity));
    
    toast({
      title: "Amenity Removed",
      description: `"${amenity}" has been removed from your property`,
    });
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
  
  // Show loading while role is being determined
  if (!currentRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }
  
  // Don't render if user is a buyer (they will be redirected by useEffect)
  if (currentRole === "buyer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
                      <div className="flex justify-center mb-4">
              <RoleBadge key={currentRole} />
            </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Add New Property</h1>
          <p className="text-lg text-neutral-600">Create a new property listing to attract potential buyers</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={(e) => {
          console.log('=== FORM SUBMIT EVENT ===');
          console.log('Form values:', form.getValues());
          console.log('Form valid:', form.formState.isValid);
          console.log('Form errors:', form.formState.errors);
          form.handleSubmit(onSubmit)(e);
        }} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Beautiful Downtown Condo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (LKR)*</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 48500000" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the property, its features, and what makes it special..."
                          className="min-h-24"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Property Type and Details */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type*</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="condo">Condo</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="squareFeet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Feet</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 1850" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 123 Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Downtown" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., CA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 90210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <ImageUpload 
                    images={imageUrls}
                    onImagesChange={setImageUrls}
                    maxImages={10}
                  />
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-base font-medium">Amenities</Label>
                    {amenities.length > 0 && (
                      <span className="text-sm text-gray-500">
                        ({amenities.length} added)
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Swimming Pool, Gym, Parking, Security System"
                      value={amenityInput}
                      onChange={(e) => setAmenityInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={addAmenity}
                      disabled={!amenityInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {amenities.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-sm font-medium text-gray-700">
                        Added Amenities:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {amenities.map((amenity, index) => (
                          <div 
                            key={amenity} 
                            className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3 group hover:bg-green-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-green-800">
                                {amenity}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAmenity(amenity)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                              title="Remove amenity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Empty State - Only show when no amenities */}
                  {amenities.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-500">
                        <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm">No amenities added yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Add amenities to make your property more attractive
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Quick Add Common Amenities - Always show */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Quick Add Common Amenities:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Swimming Pool", "Gym", "Parking", "Security System", 
                        "Air Conditioning", "Balcony", "Garden", "Elevator",
                        "Pet Friendly", "Furnished", "Internet", "CCTV"
                      ].map((commonAmenity) => (
                        <Button
                          key={commonAmenity}
                          type="button"
                          variant={amenities.includes(commonAmenity) ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (!amenities.includes(commonAmenity)) {
                              setAmenities(prev => [...prev, commonAmenity]);
                              toast({
                                title: "Amenity Added",
                                description: `"${commonAmenity}" has been added`,
                              });
                            } else {
                              toast({
                                title: "Already Added",
                                description: `"${commonAmenity}" is already in your list`,
                                variant: "destructive",
                              });
                            }
                          }}
                          className={`text-xs ${amenities.includes(commonAmenity) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={amenities.includes(commonAmenity)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {commonAmenity}
                          {amenities.includes(commonAmenity) && (
                            <span className="ml-1 text-xs">✓</span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Broker Services Checkbox - Only for Sellers */}
                {currentRole === "seller" && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="broker-services"
                          checked={needsBrokerServices}
                          onCheckedChange={(checked) => setNeedsBrokerServices(checked as boolean)}
                        />
                        <div className="space-y-2">
                          <Label htmlFor="broker-services" className="text-base font-medium">
                            I need professional broker services
                          </Label>
                          <p className="text-sm text-gray-600">
                            Connect with experienced brokers for professional property valuation, marketing, 
                            buyer screening, and negotiation support to sell your property faster and at the best price.
                          </p>
                          {needsBrokerServices && (
                            <div className="bg-blue-50 p-3 rounded-lg mt-3">
                              <h4 className="font-semibold text-blue-900 mb-2 text-sm">Broker Services Include:</h4>
                              <ul className="text-xs text-blue-800 space-y-1">
                                <li>• Professional property valuation and pricing</li>
                                <li>• Marketing and advertising strategies</li>
                                <li>• Buyer screening and qualification</li>
                                <li>• Negotiation support and contract handling</li>
                                <li>• Market analysis and timing advice</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.push("/")}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createPropertyMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      console.log('=== BUTTON CLICKED ===');
                      console.log('Form state:', form.getValues());
                      console.log('Form errors:', form.formState.errors);
                      console.log('Is form valid:', form.formState.isValid);
                      console.log('Image URLs:', imageUrls);
                    }}
                  >
                    {createPropertyMutation.isPending ? "Creating..." : "Create Property"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>



      <Footer />
    </div>
  );
}
