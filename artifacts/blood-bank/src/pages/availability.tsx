import { useGetBloodStockByGroup, getGetBloodStockByGroupQueryKey, useListBloodStock, getListBloodStockQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Droplet, AlertTriangle, Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOOD_GROUPS } from "@/lib/constants";
import { Button } from "@/components/ui/button";

export default function Availability() {
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>(undefined);
  
  const { data: stock, isLoading } = useListBloodStock({
    query: {
      queryKey: getListBloodStockQueryKey()
    }
  });

  const { data: specificStock, isLoading: isSpecificLoading } = useGetBloodStockByGroup(
    selectedGroup!,
    {
      query: {
        enabled: !!selectedGroup,
        queryKey: getGetBloodStockByGroupQueryKey(selectedGroup!)
      }
    }
  );

  // Prepare data for recharts
  const chartData = stock ? stock.map(s => ({
    name: s.blood_group,
    units: s.units_available,
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blood Availability</h1>
          <p className="text-muted-foreground mt-2">
            Real-time blood stock levels across the facility.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Check specific group" />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedGroup && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedGroup(undefined)}>
              <Loader2 className="h-4 w-4" /> {/* Actually want to clear, but just a button to reset */}
              Clear
            </Button>
          )}
        </div>
      </div>

      {selectedGroup && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary/20 p-4 rounded-full">
                <Droplet className="h-8 w-8 text-primary fill-current" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Blood Group {selectedGroup}</h3>
                <p className="text-muted-foreground">Current available stock</p>
              </div>
            </div>
            <div className="text-right">
              {isSpecificLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              ) : specificStock ? (
                <>
                  <div className="text-4xl font-bold text-primary">{specificStock.units_available}</div>
                  <div className="text-sm font-medium">Units Available</div>
                </>
              ) : (
                <div className="text-muted-foreground">Not found</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : stock ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Stock Levels by Group</CardTitle>
                <CardDescription>Current available units (Live data)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280', fontWeight: 600 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                      />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="units" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.units < 5 ? '#ef4444' : entry.units < 15 ? '#f59e0b' : '#e11d48'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>Stock Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stock.map((item) => (
                    <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${item.units_available < 5 ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-primary/10 text-primary'}`}>
                          <Droplet className="h-5 w-5 fill-current" />
                        </div>
                        <div>
                          <div className="font-bold text-lg">{item.blood_group}</div>
                          <div className="text-xs text-muted-foreground">
                            Updated {format(new Date(item.updated_at), 'MMM d, HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{item.units_available}</div>
                        <div className="text-xs text-muted-foreground">Units</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {stock.some(s => s.units_available < 5) && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardContent className="p-4 flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 dark:text-red-400">Critical Shortage</h3>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Some blood groups are critically low. Urgent donor drives may be required.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
