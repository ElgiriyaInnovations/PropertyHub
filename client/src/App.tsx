import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Auth from "@/pages/auth";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetail from "@/pages/property-detail";
import AddProperty from "@/pages/add-property";
import Profile from "@/pages/profile";
import Messages from "@/pages/messages";
import MarketInsights from "@/pages/market-insights";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/auth" component={Auth} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/properties" component={Properties} />
          <Route path="/properties/:id" component={PropertyDetail} />
          <Route path="/add-property" component={AddProperty} />
          <Route path="/profile" component={Profile} />
          <Route path="/messages" component={Messages} />
          <Route path="/market-insights" component={MarketInsights} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
