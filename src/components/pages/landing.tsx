import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Home, Handshake, Camera, TrendingUp, Users } from "lucide-react";
import Image from "next/image";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/auth";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Image 
                src="/assets/prop-logo.jpg" 
                alt="PropertyHub Logo" 
                width={32} 
                height={32} 
                className="mr-2 rounded"
              />
              <h1 className="text-2xl font-bold text-primary">Elgiriya Properties</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-neutral-800 hover:text-primary font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-neutral-800 hover:text-primary font-medium transition-colors">How It Works</a>
              <a href="#contact" className="text-neutral-800 hover:text-primary font-medium transition-colors">Contact</a>
            </nav>

            <Button onClick={handleLogin} className="bg-primary hover:bg-blue-700">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with improved overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
          }}
        />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center px-6 py-3 bg-gray-800/50 backdrop-blur-md rounded-full text-gray-100 text-sm font-medium mb-8 border border-gray-600/30">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
            Trusted by 10,000+ users across Sri Lanka
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-white leading-tight">
            Find <span className="text-gray-300">Your</span>
            <span className="block text-white drop-shadow-2xl shadow-black animate-pulse">
              Dream Property
            </span>
          </h1>
          
          {/* Feature Pills with improved design */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="group bg-gray-800/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105">
              <Home className="h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="font-medium text-gray-100">Residential Properties</span>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105">
              <TrendingUp className="h-5 w-5 mr-3 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="font-medium text-gray-100">Investment Opportunities</span>
            </div>
            <div className="group bg-gray-800/50 backdrop-blur-md rounded-full px-6 py-3 flex items-center border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105">
              <Handshake className="h-5 w-5 mr-3 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="font-medium text-gray-100">Trusted Brokers</span>
            </div>
          </div>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto mb-8">
            <Button 
              onClick={handleLogin} 
              className="group w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">Get Started Free</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button 
              onClick={handleLogin} 
              className="group w-full sm:w-auto bg-gray-800/80 border-2 border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 px-10 py-4 text-lg font-semibold rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
            >
              <span className="mr-2">Sign In</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free forever plan</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-gray-500/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>



      {/* User Roles Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Complete Solution
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Built for Every Real Estate Need</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Whether you're buying, selling, or working as a broker, we've got you covered with comprehensive tools and features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Buyers */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                B
              </div>
              <Card className="text-center p-8 h-full bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <CardContent className="pt-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Search className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Buyers</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Find your perfect home with advanced search filters, saved searches, and direct communication with agents.</p>
                  <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Advanced property search
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Save favorite properties
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Direct agent messaging
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Market insights
                    </li>
                  </ul>
                  <Button onClick={handleLogin} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    Start Searching
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sellers */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                S
              </div>
              <Card className="text-center p-8 h-full bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <CardContent className="pt-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Home className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Sellers</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">List your property with professional tools, manage inquiries, and connect with qualified buyers.</p>
                  <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Easy property listing
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Professional photography tools
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Inquiry management
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Market analytics
                    </li>
                  </ul>
                  <Button onClick={handleLogin} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    List Property
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Brokers */}
            <div className="group relative">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                B
              </div>
              <Card className="text-center p-8 h-full bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <CardContent className="pt-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Handshake className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">For Brokers</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Manage your clients, properties, and transactions all in one professional platform.</p>
                  <ul className="text-sm text-gray-600 space-y-3 mb-8 text-left">
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Client relationship management
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Property portfolio management
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Transaction tracking
                    </li>
                    <li className="flex items-center">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Lead generation tools
                    </li>
                  </ul>
                  <Button onClick={handleLogin} className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-xl transition-all duration-300 group-hover:scale-105">
                    Join as Broker
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Getting started with Elgiriya Properties is simple. Follow these three easy steps to find your perfect property or list your own.
            </p>
          </div>

          {/* Steps with improved design */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                1
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Create Your Account</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Sign up as a buyer, seller, or broker. Set up your profile with your preferences and requirements.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 font-medium">
                  <Users className="h-4 w-4" />
                  <span>Join thousands of users</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                2
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Search or List Properties</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Use our advanced search filters to find properties or list your own with detailed descriptions and photos.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 font-medium">
                  <Search className="h-4 w-4" />
                  <span>Smart search technology</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                3
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
                  <Handshake className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Connect & Close Deals</h3>
                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                  Message property owners or buyers directly through our secure platform and close your deals with confidence.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-purple-600 font-medium">
                  <Handshake className="h-4 w-4" />
                  <span>Secure transactions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features with improved design */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Elgiriya Properties?</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the features that make us the preferred choice for real estate transactions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">High-Quality Photos</h4>
              <p className="text-gray-600 leading-relaxed">Upload and manage multiple property images with our easy-to-use interface.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Market Insights</h4>
              <p className="text-gray-600 leading-relaxed">Access real-time market data and trends to make informed decisions.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Save Favorites</h4>
              <p className="text-gray-600 leading-relaxed">Create your wishlist of properties and get notified of price changes.</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">Trusted Network</h4>
              <p className="text-gray-600 leading-relaxed">Connect with verified brokers and trusted real estate professionals.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 shadow-xl">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have already found their perfect property or successfully listed their homes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={handleLogin}
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
                >
                  Get Started Now
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 text-lg font-semibold"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Get In Touch</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Have questions about Elgiriya Properties? We're here to help you navigate the real estate market with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-semibold text-neutral-800 mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Office Address</h4>
                    <p className="text-neutral-600">123 Business District<br />Colombo 03, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Phone Number</h4>
                    <p className="text-neutral-600">+94 11 234 5678</p>
                    <p className="text-sm text-neutral-500">Mon-Fri: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-primary/10 rounded-lg p-3">
                    <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-800">Email Address</h4>
                    <p className="text-neutral-600">support@propertyhub.lk</p>
                    <p className="text-sm text-neutral-500">We'll respond within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="mt-8">
                <h4 className="font-semibold text-neutral-800 mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-lg transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-lg transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.219-.359-1.219c0-1.142.662-1.997 1.482-1.997.699 0 1.039.525 1.039 1.155 0 .703-.449 1.754-.68 2.726-.194.821.411 1.492 1.219 1.492 1.326 0 2.247-1.417 2.247-3.298 0-1.805-1.126-3.11-2.832-3.11-2.046 0-3.297 1.518-3.297 3.177 0 .581.199 1.251.509 1.646.114.138.131.258.097.4-.05.69-.327 1.586-.327 1.586-.052.218-.169.265-.389.159-1.094-.508-1.775-2.107-1.775-3.399 0-2.735 1.997-5.245 5.953-5.245 3.191 0 5.341 2.298 5.341 4.719 0 3.016-1.681 5.307-4.076 5.307-.815 0-1.577-.449-1.839-.985l-.482 1.843c-.175.677-.648 1.526-1.013 2.078.83.259 1.704.398 2.606.398 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-neutral-50 p-8 rounded-lg">
              <h3 className="text-2xl font-semibold text-neutral-800 mb-6">Send Us a Message</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Subject</label>
                  <select
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled
                  >
                    <option>Select a topic</option>
                    <option>General Inquiry</option>
                    <option>Property Listing</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us how we can help you..."
                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled
                  />
                </div>

                <Button 
                  type="button" 
                  onClick={handleLogin}
                  className="w-full bg-primary hover:bg-blue-700 py-3"
                >
                  Sign In to Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image 
                  src="/assets/prop-logo.jpg" 
                  alt="PropertyHub Logo" 
                  width={32} 
                  height={32} 
                  className="mr-2 rounded"
                />
                <h3 className="text-2xl font-bold text-primary">Elgiriya Properties</h3>
              </div>
              <p className="text-neutral-400 mb-4">Your trusted platform for connecting buyers, sellers, and brokers in the real estate market.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Search Properties</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Saved Searches</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Market Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Buying Guide</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Sellers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">List Property</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Valuation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Selling Tips</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Market Analytics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 Elgiriya Properties Powered By Elgiriya Innovations. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
