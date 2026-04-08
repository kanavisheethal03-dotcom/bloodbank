import { useState } from "react";
import { useSearchDonors, getSearchDonorsQueryKey, useListBloodStock, getListBloodStockQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BLOOD_GROUPS } from "@/lib/constants";
import { Loader2, Search as SearchIcon, Droplet, User, MapPin, Phone, Mail } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const searchSchema = z.object({
  blood_group: z.enum([...BLOOD_GROUPS] as [string, ...string[]]),
  city: z.string().min(2, "City must be at least 2 characters"),
});

type SearchFormValues = z.infer<typeof searchSchema>;

export default function Search() {
  const [searchParams, setSearchParams] = useState<{ blood_group: string; city: string } | null>(null);

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      blood_group: undefined,
      city: "",
    },
  });

  const { data: donors, isLoading: isLoadingDonors } = useSearchDonors(
    searchParams!,
    {
      query: {
        enabled: !!searchParams,
        queryKey: getSearchDonorsQueryKey(searchParams!),
      }
    }
  );

  const { data: stock, isLoading: isLoadingStock } = useListBloodStock({
    query: {
      queryKey: getListBloodStockQueryKey()
    }
  });

  const onSubmit = (data: SearchFormValues) => {
    setSearchParams(data);
  };

  const getStockForGroup = (bg: string) => {
    return stock?.find(s => s.blood_group === bg)?.units_available || 0;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Blood Donors</h1>
        <p className="text-muted-foreground mt-2">
          Search for eligible donors in your city. Stock availability is shown below.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-start">
              <FormField
                control={form.control}
                name="blood_group"
                render={({ field }) => (
                  <FormItem className="w-full md:w-[200px]">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Blood Group" />
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
                name="city"
                render={({ field }) => (
                  <FormItem className="flex-1 w-full">
                    <FormControl>
                      <Input placeholder="Enter city name (e.g., New York)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full md:w-auto">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {searchParams && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          
          {isLoadingDonors ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : !donors || donors.length === 0 ? (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <SearchIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No donors found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  We couldn't find any eligible {searchParams.blood_group} donors in {searchParams.city}.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {donors.map(donor => (
                <Card key={donor.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-4 h-full flex items-center justify-center min-w-[80px]">
                        <div className="text-center">
                          <span className="text-2xl font-bold text-primary">{donor.blood_group}</span>
                        </div>
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {donor.name}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                          <MapPin className="h-4 w-4" />
                          {donor.city}
                        </p>
                        
                        <div className="mt-4 pt-4 border-t">
                          {donor.consent_status === 'Accepted' ? (
                            <div className="space-y-2">
                              {donor.phone && (
                                <p className="text-sm flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <a href={`tel:${donor.phone}`} className="text-primary hover:underline">{donor.phone}</a>
                                </p>
                              )}
                              {donor.email && (
                                <p className="text-sm flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                  <a href={`mailto:${donor.email}`} className="text-primary hover:underline">{donor.email}</a>
                                </p>
                              )}
                            </div>
                          ) : (
                            <Badge variant="secondary" className="font-normal text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                              Contact hidden - waiting for donor consent
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4 pt-8">
        <h2 className="text-xl font-semibold">Current Blood Stock</h2>
        {isLoadingStock ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : stock ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BLOOD_GROUPS.map(bg => {
              const units = getStockForGroup(bg);
              return (
                <Card key={bg} className={units === 0 ? "opacity-60" : ""}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Droplet className={`h-5 w-5 ${units > 0 ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-bold">{bg}</span>
                    </div>
                    <span className={`font-medium ${units > 0 ? "text-green-600" : "text-muted-foreground"}`}>
                      {units} Units
                    </span>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
