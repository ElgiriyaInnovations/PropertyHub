import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthHeader from "@/components/layout/auth-header";
import Footer from "@/components/layout/footer";
import { TrendingUp, TrendingDown, DollarSign, Home, Activity, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { RoleBadge } from "@/components/ui/role-badge";

export default function MarketInsights() {
  const { user } = useAuth();

  const { data: marketData, isLoading } = useQuery({
    queryKey: ["/api/market/insights"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Mock market data for demonstration
  const mockMarketData = {
    averagePrice: 45000000,
    priceChange: 5.2,
    inventory: 1200,
    inventoryChange: -8.5,
    averageDays: 25,
    daysChange: -3.2,
    salesVolume: 89,
    volumeChange: 12.1,
    trends: [
      { location: "Downtown", avgPrice: 52000000, change: 8.3 },
      { location: "Suburbs", avgPrice: 38000000, change: 3.1 },
      { location: "Waterfront", avgPrice: 75000000, change: 12.5 },
      { location: "Historic District", avgPrice: 42000000, change: -1.2 },
    ]
  };

  const data = marketData || mockMarketData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AuthHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <RoleBadge />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Market Insights</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Real-time market analytics and trends for informed property decisions
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">LKR {data.averagePrice.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.priceChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.priceChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(data.priceChange)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Inventory</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.inventory}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.inventoryChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.inventoryChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(data.inventoryChange)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Days on Market</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.averageDays} days</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.daysChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                )}
                <span className={data.daysChange > 0 ? "text-red-500" : "text-green-500"}>
                  {Math.abs(data.daysChange)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.salesVolume}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {data.volumeChange > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={data.volumeChange > 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(data.volumeChange)}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Regional Trends */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Regional Market Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.trends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{trend.location}</h3>
                    <p className="text-sm text-gray-600">Average Price: LKR {trend.avgPrice.toLocaleString()}</p>
                  </div>
                  <Badge 
                    variant={trend.change > 0 ? "default" : "secondary"}
                    className={trend.change > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {trend.change > 0 ? "+" : ""}{trend.change}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="flex-1">
            Get Detailed Market Report
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            Set Price Alerts
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            Compare Neighborhoods
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}