import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Bot, User, Sparkles, Loader2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import aiIcon from "@/assets/ai-assistant-icon.jpg";

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hi! I'm your IGCSE AI tutor. I can help you with any subject questions, find past papers, mark your work, or create study plans. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    const messageContent = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Please sign in to continue');
      }

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: messageContent,
          conversationId: conversationId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw response.error;
      }

      const { response: aiResponse, conversationId: newConversationId } = response.data;
      
      if (newConversationId && !conversationId) {
        setConversationId(newConversationId);
      }

      const aiMessage: Message = {
        id: messages.length + 2,
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: error.message || 'Please try again later'
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: messages.length + 2,
        content: "I'm sorry, I couldn't process your message right now. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 flex items-center gap-2 w-fit mx-auto">
            <Sparkles className="h-4 w-4" />
            AI Chat Interface
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Chat with Your AI Tutor
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant help with any IGCSE subject. Ask questions, request past papers, 
            or submit work for marking - your AI tutor is available 24/7.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col shadow-xl">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img src={aiIcon} alt="AI Assistant" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-lg">IGCSE AI Tutor</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground font-normal">
                    <div className="h-2 w-2 rounded-full bg-accent animate-pulse"></div>
                    Online and ready to help
                  </div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.sender === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.sender === 'ai' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-accent text-accent-foreground'
                      }`}>
                        {message.sender === 'ai' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`max-w-[75%] ${
                        message.sender === 'user' ? 'text-right' : ''
                      }`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.sender === 'ai'
                            ? 'bg-muted text-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t p-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ask about any IGCSE topic, request past papers, or submit work for marking..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    variant="ai" 
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Try: "Explain photosynthesis" • "Find Physics Paper 2 June 2023" • "Mark my essay"
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AIChat;