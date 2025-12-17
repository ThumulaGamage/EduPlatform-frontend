// src/pages/Chat.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import API from "@/api/axios";
import { formatDistanceToNow } from "date-fns";

interface Message {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    role: string;
  };
  receiverId: {
    _id: string;
    name: string;
  };
  courseId: {
    _id: string;
    title: string;
  };
  message: string;
  isRead: boolean;
  createdAt: string;
}

const Chat = () => {
  const { userId, courseId } = useParams<{ userId: string; courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversation();
    markAsRead();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(() => {
      fetchConversation(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [userId, courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async (silent = false) => {
    if (!silent) setLoading(true);
    
    try {
      const response = await API.get(`/messages/conversation/${userId}/${courseId}`);
      setMessages(response.data.messages);

      // Set other user and course info from first message
      if (response.data.messages.length > 0) {
        const firstMsg = response.data.messages[0];
        const other = firstMsg.senderId._id === user?.id ? firstMsg.receiverId : firstMsg.senderId;
        setOtherUser(other);
        setCourse(firstMsg.courseId);
      } else {
        // Fetch user and course info separately
        const [userRes, courseRes] = await Promise.all([
          API.get(`/users/${userId}`),
          API.get(`/courses/${courseId}`)
        ]);
        setOtherUser(userRes.data.user);
        setCourse(courseRes.data.course);
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
      if (!silent) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages"
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await API.put(`/messages/read/${userId}/${courseId}`);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await API.post("/messages/send", {
        receiverId: userId,
        courseId,
        message: newMessage.trim()
      });

      setNewMessage("");
      fetchConversation(true); // Refresh silently
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to send message"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/messages")}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-primary-foreground font-bold">
                  {otherUser?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{otherUser?.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{course?.title}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Messages */}
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="h-[500px] overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMe = message.senderId._id === user?.id;
                    return (
                      <div 
                        key={message._id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                          <div className={`rounded-lg p-3 ${
                            isMe 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.message}</p>
                          </div>
                          <p className={`text-xs text-muted-foreground mt-1 ${
                            isMe ? 'text-right' : 'text-left'
                          }`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat;