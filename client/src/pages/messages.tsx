import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ChatInterface from "@/components/messaging/chat-interface";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Search, Users } from "lucide-react";
import { RoleBadge } from "@/components/ui/role-badge";

export default function Messages() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: conversations, isLoading: conversationsLoading, error } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  const filteredConversations = conversations?.filter((conv: any) => {
    if (!searchQuery) return true;
    const otherUser = conv.otherUser;
    const searchLower = searchQuery.toLowerCase();
    return (
      otherUser.firstName?.toLowerCase().includes(searchLower) ||
      otherUser.lastName?.toLowerCase().includes(searchLower) ||
      otherUser.email?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getUnreadCount = (conversation: any) => {
    // This would be implemented based on the unread message count from the backend
    return 0; // Placeholder
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <RoleBadge />
          </div>
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Messages</h1>
          <p className="text-lg text-neutral-600">Connect with buyers, sellers, and brokers</p>
        </div>

        <Card className="h-[600px] flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-neutral-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-neutral-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversationsLoading ? (
                <div className="p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                      <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                        <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations && filteredConversations.length > 0 ? (
                <div className="space-y-1">
                  {filteredConversations.map((conversation: any) => {
                    const otherUser = conversation.otherUser;
                    const isActive = selectedConversation?.id === conversation.id;
                    const unreadCount = getUnreadCount(conversation);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full text-left conversation-item ${
                          isActive ? "active" : ""
                        } flex items-center space-x-3 p-4 hover:bg-neutral-50 transition-colors`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={otherUser.profileImageUrl} />
                          <AvatarFallback>
                            {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium text-neutral-800 truncate">
                              {otherUser.firstName} {otherUser.lastName}
                            </p>
                            {conversation.lastMessage && (
                              <span className="text-xs text-neutral-500">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600 truncate">
                              {conversation.lastMessage?.content || "No messages yet"}
                            </p>
                            {unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white ml-2">
                                {unreadCount}
                              </Badge>
                            )}
                          </div>

                          {conversation.property && (
                            <p className="text-xs text-neutral-500 mt-1 truncate">
                              About: {conversation.property.title}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-600 mb-2">No conversations</h3>
                  <p className="text-neutral-500 text-sm">
                    {searchQuery 
                      ? "No conversations match your search"
                      : "Start a conversation by contacting a property owner"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            {selectedConversation ? (
              <ChatInterface 
                conversation={selectedConversation}
                currentUserId={user?.id}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-neutral-600 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-neutral-500">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
