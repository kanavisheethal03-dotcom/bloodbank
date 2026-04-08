import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useCreateBloodRequest } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { BLOOD_GROUPS } from "@/lib/constants";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, HeartPulse } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";

const requestSchema = z.object({
  patient_name: z.string().min(2, "Patient name must be at least 2 characters"),
  blood_group: z.enum([...BLOOD_GROUPS] as [string, ...string[]]),
  units_required: z.coerce.number().min(1, "At least 1 unit is required").max(10, "Cannot request more than 10 units at once"),
  hospital_name: z.string().min(2, "Hospital name is required"),
  contact_number: z.string().regex(/^\d{10}$/, "Contact number must be exactly 10 digits"),
  city: z.string().min(2, "City must be at least 2 characters"),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function Request() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [success, setSuccess] = useState(false);
  
  const createRequest = useCreateBloodRequest({
    mutation: {
      onSuccess: () => {
        setSuccess(true);
        toast({
          title: "Request Submitted",
          description: "Your blood request has been successfully submitted.",
        });
        // reset form or keep success state
      },
      onError: (error) => {
        toast({
          title: "Request Failed",
          description: error.message || "An error occurred while submitting the request.",
          variant: "destructive"
        });
      }
    }
  });

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patient_name: "",
      blood_group: undefined,
      units_required: 1,
      hospital_name: "",
      contact_number: "",
      city: "",
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    createRequest.mutate({ data });
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4">
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <HeartPulse className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-400 font-bold text-lg">Request Successful</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300 mt-2 text-base">
            Request sent to nearby donors. Waiting for donor response.
            <div className="mt-6 flex gap-4">
              <Button variant="outline" onClick={() => setSuccess(false)} className="bg-white hover:bg-green-50 text-green-800 border-green-200">
                Submit Another Request
              </Button>
              <Button onClick={() => setLocation("/")} className="bg-green-600 hover:bg-green-700 text-white">
                Return Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Blood</h1>
        <p className="text-muted-foreground mt-2">
          Submit an urgent request for blood. We will notify eligible donors in your area.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient & Hospital Details</CardTitle>
          <CardDescription>Please provide accurate contact information for prompt communication.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="patient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blood_group"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group Required</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOOD_GROUPS.map((bg) => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="units_required"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Units Required</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hospital_name"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Hospital Name</FormLabel>
                      <FormControl>
                        <Input placeholder="City General Hospital" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createRequest.isPending} size="lg" className="w-full md:w-auto">
                  {createRequest.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <HeartPulse className="mr-2 h-4 w-4" />
                  )}
                  Submit Blood Request
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
