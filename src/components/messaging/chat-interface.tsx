import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, Phone, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import io from "socket.io-client";

interface ChatInterfaceProps {
  conversation: any;
  currentUserId?: string;
}

export default function ChatInterface({ conversation, currentUserId }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading: messagesLoading, error } = useQuery<any[]>({
    queryKey: [`/api/conversations/${conversation.id}/messages`],
    enabled: !!conversation.id,
    retry: false,
    refetchInterval: 5000, // Refetch every 5 seconds as fallback
  });

  // Setup WebSocket connection
  useEffect(() => {
    const socketConnection = io();
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      socketConnection.emit('join-conversation', conversation.id.toString());
    });

    socketConnection.on('new-message', (message: any) => {
      queryClient.setQueryData(
        [`/api/conversations/${conversation.id}/messages`],
        (oldMessages: any[]) => oldMessages ? [...oldMessages, message] : [message]
      );
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    });

    socketConnection.on('message-error', (error: any) => {
      toast({
        title: "Message Error",
        description: error.error || "Failed to send message",
        variant: "destructive",
      });
    });

    return () => {
      socketConnection.disconnect();
    };
  }, [conversation.id, queryClient, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({
          conversationId: conversation.id,
          content,
        }),
      });
    },
    onSuccess: (response, content) => {
      // Send via WebSocket for real-time delivery
      if (socket) {
        socket.emit('send-message', {
          conversationId: conversation.id.toString(),
          senderId: user?.id,
          content,
        });
      }
      setMessageInput("");
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
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const otherUser = conversation.otherUser;

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser.profileImageUrl || undefined} />
              <AvatarFallback>
                {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-neutral-800">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              <p className="text-sm text-neutral-600 capitalize">{otherUser.role}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {otherUser.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${otherUser.phone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
            {otherUser.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${otherUser.email}`}>
                  <Mail className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Property Context */}
        {conversation.property && (
          <div className="mt-3 p-3 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <img
                src={conversation.property.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80"}
                alt={conversation.property.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-neutral-800 truncate">
                  {conversation.property.title}
                </p>
                <p className="text-sm text-neutral-600">
                  ${parseFloat(conversation.property.price).toLocaleString()}
                </p>
              </div>
              <Link href={`/property/${conversation.property.id}`} className="inline-flex items-center justify-center p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-neutral-25">
        {messagesLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-2 animate-pulse">
                <div className="w-8 h-8 bg-neutral-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-16 bg-neutral-200 rounded-xl max-w-sm"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message: any, index: number) => {
              const isOwnMessage = message.senderId === user?.id;
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
              
              return (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${isOwnMessage ? "justify-end" : ""}`}
                >
                  {!isOwnMessage && showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={otherUser.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {otherUser.firstName?.[0]}{otherUser.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {!isOwnMessage && !showAvatar && <div className="w-8"></div>}
                  
                  <div className={`flex-1 ${isOwnMessage ? "text-right" : ""}`}>
                    <div
                      className={`message-bubble inline-block rounded-xl px-4 py-2 ${
                        isOwnMessage
                          ? "bg-primary text-white"
                          : "bg-neutral-100 text-neutral-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-neutral-500 mt-1">
                      {formatMessageTime(message.createdAt)}
                    </p>
                  </div>

                  {isOwnMessage && showAvatar && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  {isOwnMessage && !showAvatar && <div className="w-8"></div>}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-500">No messages yet. Start the conversation!</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Type your message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sendMessageMutation.isPending}
              className="resize-none"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="bg-primary hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
