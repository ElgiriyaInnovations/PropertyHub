"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoleSwitch } from "@/hooks/useRoleSwitch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RoleBadge } from "@/components/ui/role-badge";
import AuthHeader from "@/components/layout/auth-header";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Linkedin,
  Award,
  Languages,
  Star,
  CheckCircle,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Predefined options
const SPECIALTY_OPTIONS = [
  "Residential Sales",
  "Commercial Real Estate",
  "Luxury Properties",
  "Land Development",
  "Investment Properties",
  "Property Management",
  "Rental Properties",
  "New Construction",
  "Foreclosure Properties",
  "International Properties"
];

const CERTIFICATION_OPTIONS = [
  "Certified Residential Specialist (CRS)",
  "Accredited Buyer's Representative (ABR)",
  "Seller Representative Specialist (SRS)",
  "Certified Commercial Investment Member (CCIM)",
  "Graduate Realtor Institute (GRI)",
  "Certified Property Manager (CPM)",
  "Real Estate Broker License",
  "Real Estate Sales License",
  "Luxury Property Specialist",
  "International Property Specialist"
];

const LANGUAGE_OPTIONS = [
  "English",
  "Sinhala",
  "Tamil",
  "Hindi",
  "Arabic",
  "Chinese",
  "French",
  "German",
  "Spanish",
  "Portuguese"
];

const LOCATION_OPTIONS = [
  "Colombo",
  "Kandy",
  "Galle",
  "Negombo",
  "Jaffna",
  "Anuradhapura",
  "Polonnaruwa",
  "Trincomalee",
  "Batticaloa",
  "Ratnapura",
  "Kurunegala",
  "Matara",
  "Kalutara",
  "Gampaha",
  "Kegalle"
];

interface BrokerFormData {
  licenseNumber: string;
  experience: number;
  specialties: string[];
  certifications: string[];
  languages: string[];
  location: string;
  serviceAreas: string[];
  commissionRate?: number;
  bio: string;
  phone: string;
  website: string;
  linkedin: string;
}

export default function BrokerRegistration() {
  const { user } = useAuth();
  const { currentRole } = useRoleSwitch();
  const router = useRouter();
  
  const [formData, setFormData] = useState<BrokerFormData>({
    licenseNumber: "",
    experience: 0,
    specialties: [],
    certifications: [],
    languages: [],
    location: "",
    serviceAreas: [],
    commissionRate: undefined,
    bio: "",
    phone: "",
    website: "",
    linkedin: "",
  });

  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedCertification, setSelectedCertification] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedServiceArea, setSelectedServiceArea] = useState("");

  // Check if user already has a broker profile
  const { data: existingBroker, isLoading: checkingProfile } = useQuery({
    queryKey: ["/api/brokers/register"],
    queryFn: async () => {
      const response = await fetch("/api/brokers/register");
      if (response.status === 404) {
        return null; // No existing profile
      }
      if (!response.ok) {
        throw new Error("Failed to check broker profile");
      }
      return response.json();
    },
    retry: false,
  });

  // Create broker profile mutation
  const createBrokerMutation = useMutation({
    mutationFn: async (data: BrokerFormData) => {
      const response = await fetch("/api/brokers/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create broker profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your broker profile has been created successfully.",
      });
      router.push("/broker-registry");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof BrokerFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addToArray = (field: keyof BrokerFormData, value: string) => {
    if (value && Array.isArray(formData[field]) && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value]
      }));
    }
  };

  const removeFromArray = (field: keyof BrokerFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.specialties.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one specialty.",
        variant: "destructive",
      });
      return;
    }

    createBrokerMutation.mutate(formData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
              <p className="text-gray-600">Please log in to register as a broker.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Checking your profile...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (existingBroker) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthHeader />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Broker Profile Already Exists</h2>
              <p className="text-gray-600 mb-4">
                You already have a broker profile registered.
              </p>
              <Button onClick={() => router.push("/broker-registry")}>
                View Broker Registry
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthHeader />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <RoleBadge key={currentRole} />
          </div>
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Register as a Broker
          </h1>
          <p className="text-center text-gray-600">
            Join our network of professional real estate brokers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="Enter your real estate license number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Primary Location *</Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select your primary location</option>
                  {LOCATION_OPTIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Tell us about your experience and expertise..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Specialties *
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a specialty</option>
                  {SPECIALTY_OPTIONS.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => {
                    addToArray("specialties", selectedSpecialty);
                    setSelectedSpecialty("");
                  }}
                  disabled={!selectedSpecialty}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray("specialties", specialty)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedCertification}
                  onChange={(e) => setSelectedCertification(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a certification</option>
                  {CERTIFICATION_OPTIONS.map((cert) => (
                    <option key={cert} value={cert}>
                      {cert}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => {
                    addToArray("certifications", selectedCertification);
                    setSelectedCertification("");
                  }}
                  disabled={!selectedCertification}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert) => (
                  <Badge key={cert} variant="secondary" className="flex items-center gap-1">
                    {cert}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray("certifications", cert)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Languages className="h-5 w-5 mr-2" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a language</option>
                  {LANGUAGE_OPTIONS.map((language) => (
                    <option key={language} value={language}>
                      {language}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  onClick={() => {
                    addToArray("languages", selectedLanguage);
                    setSelectedLanguage("");
                  }}
                  disabled={!selectedLanguage}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((language) => (
                  <Badge key={language} variant="secondary" className="flex items-center gap-1">
                    {language}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeFromArray("languages", language)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.commissionRate || ""}
                    onChange={(e) => handleInputChange("commissionRate", parseFloat(e.target.value) || undefined)}
                    placeholder="2.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={createBrokerMutation.isPending}
              className="px-8"
            >
              {createBrokerMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                "Register as Broker"
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
