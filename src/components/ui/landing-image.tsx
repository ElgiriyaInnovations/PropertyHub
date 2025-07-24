import { Home, Search, Handshake, TrendingUp } from "lucide-react";

interface LandingImageProps {
  title: string;
  subtitle: string;
  role?: "buyer" | "seller" | "broker";
  showBackground?: boolean;
  className?: string;
}

export function LandingImage({ 
  title, 
  subtitle, 
  role,
  showBackground = true,
  className = "" 
}: LandingImageProps) {
  const getRoleConfig = (role?: string) => {
    switch (role) {
      case "buyer":
        return {
          icon: Search,
          color: "from-blue-500 to-blue-600",
          bgColor: "bg-blue-50",
          textColor: "text-blue-700"
        };
      case "seller":
        return {
          icon: Home,
          color: "from-green-500 to-green-600",
          bgColor: "bg-green-50",
          textColor: "text-green-700"
        };
      case "broker":
        return {
          icon: Handshake,
          color: "from-purple-500 to-purple-600",
          bgColor: "bg-purple-50",
          textColor: "text-purple-700"
        };
      default:
        return {
          icon: TrendingUp,
          color: "from-gray-500 to-gray-600",
          bgColor: "bg-gray-50",
          textColor: "text-gray-700"
        };
    }
  };

  const roleConfig = getRoleConfig(role);
  const Icon = roleConfig.icon;

  return (
    <div className={`relative min-h-[400px] flex items-center justify-center overflow-hidden ${className}`}>
      {/* Background Image */}
      {showBackground && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-black/90"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center bg-fixed"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')"
            }}
          />
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </>
      )}
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {/* Role Badge */}
        {role && (
          <div className={`inline-flex items-center px-6 py-3 ${roleConfig.bgColor} ${roleConfig.textColor} rounded-full text-sm font-medium mb-8 border border-current/20 backdrop-blur-md`}>
            <Icon className="h-4 w-4 mr-2" />
            <span className="capitalize">{role}</span>
          </div>
        )}
        
        {/* Main Heading */}
        <h1 className={`text-4xl md:text-6xl font-bold mb-6 leading-tight ${showBackground ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        
        {/* Subtitle */}
        <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${showBackground ? 'text-gray-200' : 'text-gray-600'} max-w-2xl mx-auto`}>
          {subtitle}
        </p>
        
        {/* Decorative Elements */}
        <div className="flex justify-center space-x-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-300"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-600"></div>
        </div>
      </div>
    </div>
  );
} 