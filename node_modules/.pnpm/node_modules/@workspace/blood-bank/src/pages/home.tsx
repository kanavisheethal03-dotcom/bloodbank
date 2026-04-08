import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Users, Activity, HeartPulse, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MedicalChatbot } from "@/components/chat/medical-chatbot";
import { EmergencySOS } from "@/components/emergency/sos-modal";

export default function Home() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: {
      queryKey: getGetDashboardSummaryQueryKey()
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          BloodBank Pro
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Connecting life-saving donors with patients in urgent need.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-primary shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total_donors}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.eligible_donors} currently eligible
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-chart-2 shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
              <HeartPulse className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total_requests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.pending_requests} pending fulfillment
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-chart-3 shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Units</CardTitle>
              <Droplets className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary.total_units_available}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all blood groups
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-chart-4 shadow-sm hover-elevate">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
              <Activity className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground mt-1">
                All services operational
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Register as Donor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Join our life-saving registry. One donation can save up to three lives. Registration is quick and secure.
            </p>
            <Link href="/register" className="w-full">
              <Button className="w-full">Register Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Find Blood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Search for eligible donors in your city by blood group. View real-time availability and stock levels.
            </p>
            <Link href="/search" className="w-full">
              <Button variant="secondary" className="w-full">Search Donors</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader>
            <CardTitle>Request Blood</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Urgent requirement? Submit a request to immediately notify eligible nearby donors of your need.
            </p>
            <Link href="/request" className="w-full">
              <Button variant="outline" className="w-full">Submit Request</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <MedicalChatbot />

      <div className="fixed bottom-24 right-6 pointer-events-none">
        <div className="pointer-events-auto">
          <EmergencySOS />
        </div>
      </div>
    </div>
  );
}
