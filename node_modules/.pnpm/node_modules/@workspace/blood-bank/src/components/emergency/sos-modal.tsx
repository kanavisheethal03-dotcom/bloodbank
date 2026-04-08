import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertCircle, 
  Mic, 
  MicOff, 
  Search, 
  Loader2, 
  CheckCircle2, 
  Truck, 
  MapPin,
  Heart,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSubmitEmergencySOS } from "@workspace/api-client-react";
import type { EmergencyMatchResponse } from "@workspace/api-client-react";

export function EmergencySOS() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<EmergencyMatchResponse | null>(null);
  const { toast } = useToast();
  const emergencyMutation = useSubmitEmergencySOS();

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log("Voice Transcript:", transcript);
      
      // Basic AI-style parsing of the voice input
      const groups = ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-"];
      const foundGroup = groups.find(g => transcript.includes(g));
      if (foundGroup) setBloodGroup(foundGroup.toUpperCase());

      // Simple city detection (last word usually)
      if (transcript.includes("in ")) {
        const cityPart = transcript.split("in ")[1];
        if (cityPart) setCity(cityPart.charAt(0).toUpperCase() + cityPart.slice(1));
      }

      toast({
        title: "Voice Captured",
        description: `Recognized: "${transcript}"`
      });
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const startEmergencyAI = async () => {
    if (!bloodGroup || !city) {
      toast({
        title: "Missing Information",
        description: "Please provide blood group and city.",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setResult(null);

    emergencyMutation.mutate(
      { data: { blood_group: bloodGroup, city, urgency: "critical" } },
      {
        onSuccess: (data) => {
          // Artificial delay to show "AI Matchmaking"
          setTimeout(() => {
            setResult(data);
            setIsSearching(false);
          }, 2000);
        },
        onError: () => {
          toast({
            title: "Search Failed",
            description: "Could not connect to emergency services.",
            variant: "destructive",
          });
          setIsSearching(false);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) setResult(null);
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-bold h-16 px-8 rounded-full shadow-2xl hover:scale-105 transition-all gap-2">
          <AlertCircle className="h-6 w-6 animate-pulse" />
          EMERGENCY SOS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2 text-red-600">
            <Heart className="fill-red-600 h-6 w-6" />
            AI Emergency Response
          </DialogTitle>
          <DialogDescription>
            Instantly match with the nearest donor or blood bank in seconds.
          </DialogDescription>
        </DialogHeader>

        {!result && !isSearching && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood">Blood Group</Label>
                <Input 
                  id="blood" 
                  placeholder="e.g. O+" 
                  value={bloodGroup} 
                  onChange={(e) => setBloodGroup(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="e.g. Mumbai" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
               <Label className="text-xs text-muted-foreground">Voice Assistant Trigger</Label>
               <Button 
                variant="outline" 
                className={cn("w-full gap-2 border-dashed", isListening && "bg-red-50 border-red-300 text-red-600 animate-pulse")}
                onClick={handleVoiceInput}
               >
                 {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                 {isListening ? "Listening..." : "Speak Request (e.g. Need O+ in Mumbai)"}
               </Button>
            </div>
          </div>
        )}

        {isSearching && (
           <div className="py-12 flex flex-col items-center justify-center space-y-4">
             <Loader2 className="h-12 w-12 animate-spin text-red-600" />
             <div className="text-center">
                <p className="font-semibold text-lg animate-pulse">Running AI Matchmaker...</p>
                <p className="text-sm text-muted-foreground italic">Analyzing nearby donor availability & transit routes</p>
             </div>
           </div>
        )}

        {result && (
           <div className="space-y-4 py-4 animate-in zoom-in-95 duration-300">
             <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                <div>
                   <p className="font-bold text-green-800">Match Found!</p>
                   <p className="text-sm text-green-700">{result.ai_summary}</p>
                </div>
             </div>

             <Card className="border-2 border-red-100 shadow-none">
                <CardContent className="p-4 space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{result.match?.type}</span>
                      <Badge variant="destructive" className="bg-red-600">CRITICAL</Badge>
                   </div>
                   <p className="text-xl font-bold">{result.match?.name}</p>
                   <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {city} (Nearest Location)
                   </div>
                   <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 p-2 rounded">
                      <Truck className="h-4 w-4" />
                      Est. Response Time: {result.match?.estimated_delivery}
                   </div>
                </CardContent>
             </Card>

             <Button className="w-full bg-red-600 py-6 text-lg" onClick={() => toast({ title: "Alert Sent", description: "Donor and nearby facilities have been notified of your emergency." })}>
                CONFIRM & SEND ALERTS
             </Button>
           </div>
        )}

        <DialogFooter>
          {!result && !isSearching && (
            <Button className="w-full bg-red-600" onClick={startEmergencyAI}>
               FIND MATCH INSTANTLY
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
