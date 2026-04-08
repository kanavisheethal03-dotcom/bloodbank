import { Link, useLocation } from "wouter";
import { Droplets, Home, UserPlus, Search, HandHeart, Activity, Shield, LogOut, CheckCircle2, ClipboardCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/register", label: "Register Donor", icon: UserPlus },
  { href: "/search", label: "Find Blood", icon: Search },
  { href: "/request", label: "Request Blood", icon: HandHeart },
  { href: "/availability", label: "Blood Stock", icon: Activity },
  { href: "/admin/expiry", label: "Inventory Expiry", icon: ClipboardCheck },
];

const ADMIN_ITEMS = [
  { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
];

export function Sidebar() {
  const [location] = useLocation();
  const { isAdmin, logout } = useAuth();
  
  const { data: health } = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey(),
      refetchInterval: 60000
    }
  });

  return (
    <div className="w-64 border-r bg-sidebar flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary text-lg">
          <Droplets className="h-6 w-6" />
          BloodBank Pro
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-6 px-4">
        <div className="flex flex-col gap-1">
          <div className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Public Services
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
            Administration
          </div>
          {ADMIN_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          
          {!isAdmin ? (
             <Link
               href="/admin/login"
               className={cn(
                 "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                 location === "/admin/login"
                   ? "bg-sidebar-primary text-sidebar-primary-foreground"
                   : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
               )}
             >
               <Shield className="h-4 w-4" />
               Admin Login
             </Link>
          ) : (
            <button
              onClick={() => logout()}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </div>
      
      <div className="p-4 border-t text-xs text-muted-foreground flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span>API Status</span>
          {health?.status === 'ok' ? (
            <span className="flex items-center text-green-600 font-medium">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Online
            </span>
          ) : (
            <span className="text-muted-foreground">Checking...</span>
          )}
        </div>
        <div className="text-center mt-2 border-t pt-2 border-border/50">
          Life-saving platform
        </div>
      </div>
    </div>
  );
}
