import { useAuth } from "@/hooks/use-auth";
import { useGetAlerts, useMarkAlertRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, CheckCircle2, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientAlerts() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: alerts, isLoading } = useGetAlerts({ userId: user?.id });
  const markAsRead = useMarkAlertRead();

  const handleMarkAsRead = async (id: number) => {
    await markAsRead.mutateAsync({ alertId: id });
    queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("alertsNotifications")}</h1>
        <p className="text-muted-foreground mt-1">{t("healthWarnings")}</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : alerts?.length ? (
          alerts.map((alert) => (
            <Card key={alert.id} className={cn(
              "overflow-hidden transition-all",
              !alert.isRead ? "border-l-4 shadow-md" : "opacity-75 shadow-sm",
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

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {alert.type.replace('_', ' ').toUpperCase()}
                      {!alert.isRead && <Badge variant="default" className="text-[10px] h-5 px-1.5">NEW</Badge>}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-foreground/90">{alert.message}</p>

                  {alert.vitals && (
                    <div className="mt-3 p-3 bg-card rounded border text-sm font-mono flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {alert.vitals}
                    </div>
                  )}
                </div>

                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(alert.id)}
                    disabled={markAsRead.isPending}
                    className="shrink-0 mt-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t("markRead")}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">{t("allCaughtUp")}</h3>
            <p className="text-muted-foreground">{t("noActiveAlerts")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
