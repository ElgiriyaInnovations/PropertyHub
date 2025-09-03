// Market Insights page temporarily disabled
"use client";

import MarketInsights from "@/components/pages/market-insights";

export default function MarketInsightsPage() {
  // Temporarily redirect to home page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Market Insights Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          This feature is currently being updated. Please check back later.
        </p>
      </div>
    </div>
  );
} 