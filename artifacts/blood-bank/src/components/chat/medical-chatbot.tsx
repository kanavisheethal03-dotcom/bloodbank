import React, { useState, useRef, useEffect } from "react";
import { Bot, User, Send, X, MessageSquareHeart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

import { useSendChatMessage } from "@workspace/api-client-react";

export function MedicalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am MedAssist AI. Please describe your symptoms and I can help outline possible conditions. Please remember I am an AI and cannot provide professional medical diagnosis."
    }
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatMutation = useSendChatMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput("");

    chatMutation.mutate(
      { data: { messages: newMessages.map(m => ({ role: m.role as any, content: m.content })) } },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        },
        onError: (error) => {
          console.error(error);
          setMessages((prev) => [
            ...prev, 
            { role: "assistant", content: "I'm sorry, I encountered an error connecting to my diagnostic servers. Please ensure the Hugging Face API key is set in your .env file." }
          ]);
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl bg-red-600 hover:bg-red-700 p-0 z-50 flex items-center justify-center transition-transform hover:scale-110"
      >
        <MessageSquareHeart className="h-7 w-7 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] shadow-2xl flex flex-col z-50 border-red-100 overflow-hidden animate-in slide-in-from-bottom-5">
      <CardHeader className="p-4 bg-red-600 text-white flex flex-row items-center justify-between space-y-0 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          <CardTitle className="text-lg font-semibold">MedAssist AI</CardTitle>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-red-500 hover:text-white rounded-full" onClick={() => setIsOpen(false)}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 p-4 overflow-hidden flex flex-col bg-slate-50/50">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-start max-w-[85%] gap-2",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm",
                  msg.role === "user" ? "bg-slate-100 border-slate-200" : "bg-red-100 border-red-200 text-red-600"
                )}>
                  {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={cn(
                  "rounded-lg px-3 py-2 text-sm shadow-sm",
                  msg.role === "user" ? "bg-slate-900 text-white" : "bg-white border"
                )}>
                  <span className="whitespace-pre-wrap leading-relaxed">{msg.content}</span>
                </div>
              </div>
            ))}
            
            {chatMutation.isPending && (
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 border border-red-200 text-red-600">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-3 py-3 text-sm shadow-sm bg-white border flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                </div>
              </div>
            )}
            {/* Invisible div for scrolling to bottom */}
            <div className="h-px" />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-3 bg-white border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms..."
            className="flex-1"
            disabled={chatMutation.isPending}
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-red-600 hover:bg-red-700 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
