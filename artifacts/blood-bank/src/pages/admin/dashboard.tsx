import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  useListDonors, 
  getListDonorsQueryKey, 
  useUpdateDonorStatus,
  useUpdateDonorConsent,
  useListBloodRequests,
  getListBloodRequestsQueryKey,
  useUpdateBloodRequestStatus,
  useGetDonor,
  getGetDonorQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle, Phone, Mail, Droplet, User, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const statusColors: Record<string, string> = {
  Eligible: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
  Deferred: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
  Fulfilled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200",
  Accepted: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200",
};

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [selectedDonorId, setSelectedDonorId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      setLocation("/admin/login");
    }
  }, [isAdmin, setLocation]);

  const { data: donors, isLoading: isDonorsLoading } = useListDonors(
    filterStatus === "All" ? undefined : { status: filterStatus as any },
    {
      query: {
        queryKey: getListDonorsQueryKey(filterStatus === "All" ? undefined : { status: filterStatus as any }),
        enabled: isAdmin
      }
    }
  );

  const { data: requests, isLoading: isRequestsLoading } = useListBloodRequests({
    query: {
      queryKey: getListBloodRequestsQueryKey(),
      enabled: isAdmin
    }
  });

  const { data: donorDetails, isLoading: isDonorLoading } = useGetDonor(
    selectedDonorId!,
    {
      query: {
        enabled: !!selectedDonorId && isAdmin,
        queryKey: getGetDonorQueryKey(selectedDonorId!)
      }
    }
  );

  const updateStatus = useUpdateDonorStatus({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Status Updated", description: `${data.name} is now ${data.status}.` });
        queryClient.invalidateQueries({ queryKey: getListDonorsQueryKey() });
      }
    }
  });

  const updateConsent = useUpdateDonorConsent({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Consent Updated", description: `${data.name} consent is now ${data.consent_status}.` });
        queryClient.invalidateQueries({ queryKey: getListDonorsQueryKey() });
      }
    }
  });

  const updateRequestStatus = useUpdateBloodRequestStatus({
    mutation: {
      onSuccess: () => {
        toast({ title: "Request Updated", description: `Blood request status has been updated.` });
        queryClient.invalidateQueries({ queryKey: getListBloodRequestsQueryKey() });
      }
    }
  });

  const handleUpdateStatus = (id: number, status: 'Eligible' | 'Rejected' | 'Deferred') => {
    updateStatus.mutate({ id, data: { status } });
  };

  const handleUpdateConsent = (id: number, consent_status: 'Accepted' | 'Rejected') => {
    updateConsent.mutate({ id, data: { consent_status } });
  };

  const handleUpdateRequestStatus = (id: number, request_status: 'Accepted' | 'Rejected' | 'Fulfilled') => {
    updateRequestStatus.mutate({ id, data: { request_status } });
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage donor registrations, blood requests, and facility operations.
          </p>
        </div>
      </div>

      <Tabs defaultValue="donors" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="donors">Donors Management</TabsTrigger>
          <TabsTrigger value="requests">Blood Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="donors">
          <Card>
            <CardHeader className="py-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Registered Donors</CardTitle>
              <div className="w-[200px]">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Eligible">Eligible</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Deferred">Deferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isDonorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !donors || donors.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No donors found matching the criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Donor</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Consent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donors.map((donor) => (
                        <TableRow key={donor.id}>
                          <TableCell>
                            <div className="font-medium flex items-center gap-2">
                              {donor.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{donor.city}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 font-bold text-primary">
                              <Droplet className="h-3.5 w-3.5 fill-current" />
                              {donor.blood_group}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {donor.phone}
                              </div>
                              <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {donor.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            {format(new Date(donor.registration_date), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-normal ${
                                donor.consent_status === 'Accepted' ? 'bg-green-50 text-green-700 border-green-200' : 
                                donor.consent_status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''
                              }`}
                            >
                              {donor.consent_status}
                            </Badge>
                            {donor.consent_status === 'None' && (
                               <div className="flex gap-1 mt-1">
                                 <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600" onClick={() => handleUpdateConsent(donor.id, 'Accepted')}>
                                   <CheckCircle className="h-3 w-3" />
                                 </Button>
                                 <Button size="icon" variant="ghost" className="h-6 w-6 text-red-600" onClick={() => handleUpdateConsent(donor.id, 'Rejected')}>
                                   <XCircle className="h-3 w-3" />
                                 </Button>
                               </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[donor.status]}>
                              {donor.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => setSelectedDonorId(donor.id)}
                                title="View Medical Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {donor.status === 'Pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 px-2 h-8"
                                    onClick={() => handleUpdateStatus(donor.id, 'Eligible')}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 px-2 h-8"
                                    onClick={() => handleUpdateStatus(donor.id, 'Rejected')}
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              {donor.status !== 'Pending' && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-muted-foreground h-8"
                                  onClick={() => handleUpdateStatus(donor.id, 'Pending')}
                                >
                                  Reset
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader className="py-4 border-b bg-muted/20">
              <CardTitle className="text-lg">Hospital Blood Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isRequestsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !requests || requests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No active blood requests.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Patient / Hospital</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Location & Contact</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="text-xs">
                            {format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{request.patient_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{request.hospital_name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-bold text-primary flex items-center gap-1 text-sm">
                              <Droplet className="h-3 w-3 fill-current" />
                              {request.blood_group} 
                              <span className="font-normal text-muted-foreground ml-1">({request.units_required} units)</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{request.city}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{request.contact_number}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusColors[request.request_status] || ""}>
                              {request.request_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {request.request_status === 'Pending' && (
                              <div className="flex justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50 px-2 h-8"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'Accepted')}
                                >
                                  Process
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 border-red-200 hover:bg-red-50 px-2 h-8"
                                  onClick={() => handleUpdateRequestStatus(request.id, 'Rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                            {request.request_status === 'Accepted' && (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-600 border-green-200 hover:bg-green-50 px-2 h-8"
                                onClick={() => handleUpdateRequestStatus(request.id, 'Fulfilled')}
                              >
                                Mark Fulfilled
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedDonorId} onOpenChange={(open) => !open && setSelectedDonorId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Donor Medical Details</DialogTitle>
            <DialogDescription>
              Comprehensive medical information for evaluation.
            </DialogDescription>
          </DialogHeader>
          
          {isDonorLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : donorDetails ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <div className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  {donorDetails.name}
                </div>
                <Badge variant="outline" className={statusColors[donorDetails.status]}>
                  {donorDetails.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground mb-1">Blood Group</div>
                  <div className="font-medium text-primary text-xl flex items-center gap-1">
                    <Droplet className="h-5 w-5 fill-current" />
                    {donorDetails.blood_group}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Age & Weight</div>
                  <div className="font-medium">{donorDetails.age} years, {donorDetails.weight} kg</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground mb-1">Medical Conditions / Diseases</div>
                  <div className={`font-medium p-2 rounded-md ${donorDetails.disease !== 'None' ? 'bg-red-50 text-red-700' : 'bg-muted/50'}`}>
                    {donorDetails.disease}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Last Donation</div>
                  <div className="font-medium">
                    {donorDetails.last_donation_date ? format(new Date(donorDetails.last_donation_date), 'MMMM d, yyyy') : 'Never'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Registration Date</div>
                  <div className="font-medium">
                    {format(new Date(donorDetails.registration_date), 'MMMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">Donor not found.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
