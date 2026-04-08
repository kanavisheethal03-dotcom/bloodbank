import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { useListDetailedInventory } from "@workspace/api-client-react";

export function ExpiryDashboard() {
  const { data: inventory, isLoading } = useListDetailedInventory();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Urgent":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Urgent</Badge>;
      case "Use Soon":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1"><Clock className="h-3 w-3" /> Use Soon</Badge>;
      case "Safe":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 gap-1"><CheckCircle className="h-3 w-3" /> Safe</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Expiry Dashboard</h2>
          <p className="text-muted-foreground">Real-time tracking of blood inventory expiration stages.</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-3">
             <div className="h-3 w-3 rounded-full bg-red-500" />
             <span className="text-sm font-medium">Urgent (&gt;30d)</span>
          </Card>
          <Card className="px-4 py-2 flex items-center gap-3">
             <div className="h-3 w-3 rounded-full bg-yellow-500" />
             <span className="text-sm font-medium">Use Soon (&gt;20d)</span>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serial ID</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Donation Date</TableHead>
                <TableHead>Days Since Donation</TableHead>
                <TableHead>Priority Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((bag) => (
                <TableRow key={bag.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-500">#BB-{bag.id.toString().padStart(4, '0')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-lg px-3 py-0 font-bold border-red-200 text-red-700 bg-red-50">
                      {bag.blood_group}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(bag.donation_date), "MMM dd, yyyy")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      bag.status === "Urgent" ? "text-red-600" : bag.status === "Use Soon" ? "text-yellow-600" : "text-green-600"
                    )}>
                      {bag.days_until_expiry} Days Left
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(bag.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
