import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAiChat } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bot, User as UserIcon, Send, Sparkles, Loader2, Mic, MicOff, Phone, FileText, Activity, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

export default function AiAssistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello ${user?.name}! I'm your VitalCare AI Health Assistant. I can answer questions about your vitals, explain medical terms, or provide wellness tips.\n\nYou can also use the 🎙️ voice button to speak your question. How can I help you today?`,
      timestamp: new Date(),
    }
  ]);
  const chatMutation = useAiChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const userMsg = text.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, timestamp: new Date() }]);
    try {
      const res = await chatMutation.mutateAsync({ data: { message: userMsg } });
      setMessages(prev => [...prev, { role: "assistant", content: res.reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I couldn't connect to the medical knowledge base right now. Please try again.", timestamp: new Date() }]);
    }
  };

  const handleVoice = () => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      toast({ title: "Voice not supported", description: "Your browser does not support voice input.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const lower = transcript.toLowerCase();
      if (lower.includes("call ambulance")) {
        handleSend("I need an ambulance, this is an emergency!");
      } else if (lower.includes("check my health") || lower.includes("health status")) {
        handleSend("What is my current health status based on recent vitals?");
      } else if (lower.includes("bp report") || lower.includes("blood pressure")) {
        handleSend("Show me information about blood pressure and my readings.");
      } else if (lower.includes("remind medicine") || lower.includes("medication")) {
        handleSend("What are some tips for remembering to take medication on time?");
      } else {
        handleSend(transcript);
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
      toast({ title: "Voice error", description: "Could not capture voice. Please try again.", variant: "destructive" });
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const quickActions = [
    { label: "Heart Rate", icon: Activity, msg: "What is a normal resting heart rate?" },
    { label: "Blood Pressure", icon: Stethoscope, msg: "How can I lower my blood pressure naturally?" },
    { label: "Diabetes Tips", icon: Sparkles, msg: "What are the warning signs of diabetes?" },
    { label: "Emergency", icon: Phone, msg: "What should I do in a cardiac emergency?" },
  ];

  const formatTime = (d: Date) => d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="h-[calc(100vh-8rem)] animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Health Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Ask anything — powered by medical AI. Voice-enabled.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            Online
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.open("/api/generate-report", "_blank")}>
            <FileText className="h-3.5 w-3.5" />
            Get Report
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {quickActions.map((a) => (
          <Button key={a.label} variant="outline" size="sm"
            className="rounded-full text-xs gap-1.5 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
            onClick={() => handleSend(a.msg)} disabled={chatMutation.isPending}>
            <a.icon className="h-3.5 w-3.5 text-primary" />
            {a.label}
          </Button>
        ))}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3 border-b bg-muted/30">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">VitalCare AI</p>
            <p className="text-xs text-muted-foreground">Medical AI Assistant • Always available</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-5 pb-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3 max-w-[88%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                <div className={cn(
                  "h-9 w-9 shrink-0 rounded-full flex items-center justify-center border shadow-sm",
                  msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"
                )}>
                  {msg.role === "user" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>
                <div className={cn("flex flex-col gap-1", msg.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl shadow-sm text-sm whitespace-pre-wrap leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/60 border rounded-tl-sm text-foreground"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center border bg-background border-border">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-muted/60 border rounded-tl-sm text-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 bg-background border-t">
          {isListening && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
              Listening... speak now
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your health..."
              className="flex-1 h-11 bg-muted/30 border-border focus-visible:ring-primary/20"
              disabled={chatMutation.isPending}
            />
            <Button
              type="button"
              size="icon"
              variant={isListening ? "destructive" : "outline"}
              className="h-11 w-11 shrink-0 rounded-full"
              onClick={handleVoice}
              title="Voice input"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full" disabled={!input.trim() || chatMutation.isPending}>
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
          <div className="text-center mt-2 text-[10px] text-muted-foreground uppercase tracking-widest">
            AI can make mistakes. Always consult a real doctor for medical advice.
          </div>
        </div>
      </Card>
    </div>
  );
}
