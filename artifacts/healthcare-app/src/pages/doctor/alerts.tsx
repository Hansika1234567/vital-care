import { useGetAlerts, useMarkAlertRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, AlertTriangle, CheckCircle2, Activity, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DoctorAlerts() {
  const queryClient = useQueryClient();
  const { data: alerts, isLoading } = useGetAlerts();
  const markAsRead = useMarkAlertRead();

  const handleMarkRead = async (id: number) => {
    await markAsRead.mutateAsync({ alertId: id });
    queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
  };

  const critical = alerts?.filter(a => a.severity === "critical") ?? [];
  const unread = alerts?.filter(a => !a.isRead) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            Emergency Alerts
          </h1>
          <p className="text-muted-foreground mt-1">Patient critical alerts and health warnings requiring attention.</p>
        </div>
        <div className="flex gap-2">
          {critical.length > 0 && (
            <Badge className="gap-1.5 bg-destructive animate-pulse">
              <Flame className="h-3 w-3" /> {critical.length} Critical
            </Badge>
          )}
          {unread.length > 0 && (
            <Badge variant="secondary" className="gap-1.5">
              {unread.length} Unread
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : alerts?.length ? (
          alerts.map(alert => (
            <Card key={alert.id} className={cn(
              "overflow-hidden transition-all",
              !alert.isRead ? "border-l-4 shadow-md" : "opacity-70 shadow-sm",
              !alert.isRead && alert.severity === "critical" ? "border-l-destructive bg-destructive/5" : "",
              !alert.isRead && alert.severity === "warning" ? "border-l-amber-500 bg-amber-500/5" : ""
            )}>
              <CardContent className="p-6 flex items-start gap-4">
                <div className={cn(
                  "p-3 rounded-full shrink-0",
                  alert.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                )}>
                  {alert.severity === "critical" ? <Flame className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      {alert.type.replace(/_/g, " ").toUpperCase()}
                      {!alert.isRead && (
                        <Badge variant="default" className="text-[10px] h-5 px-1.5">NEW</Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[10px]",
                        alert.severity === "critical"
                          ? "border-destructive/30 text-destructive bg-destructive/5"
                          : "border-amber-300 text-amber-700 bg-amber-50"
                      )}>
                        {alert.severity}
                      </Badge>
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground/90 text-sm">{alert.message}</p>
                  {alert.vitals && (
                    <div className="mt-2 p-2.5 bg-card rounded border text-xs font-mono flex items-center gap-2">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      {alert.vitals}
                    </div>
                  )}
                </div>

                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 mt-1"
                    disabled={markAsRead.isPending}
                    onClick={() => handleMarkRead(alert.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Acknowledge
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">All clear</h3>
            <p className="text-muted-foreground">No patient alerts at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
}
