import { useState } from "react";
import { useGetAlerts, useMarkAlertRead } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flame, AlertTriangle, CheckCircle2, Activity, ShieldAlert, User, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type AlertWithPatient = {
  id: number;
  userId: number;
  type: string;
  severity: string;
  message: string;
  vitals?: string | null;
  isRead: boolean;
  createdAt: string;
  patientName?: string;
};

const PATIENT_COLORS: Record<string, string> = {
  "Demo Patient": "bg-blue-500",
  "Pooja": "bg-purple-500",
  "Test": "bg-amber-500",
};

export default function DoctorAlerts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: rawAlerts, isLoading } = useGetAlerts();
  const markAsRead = useMarkAlertRead();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [patientFilter, setPatientFilter] = useState("all");

  const alerts = rawAlerts as AlertWithPatient[] | undefined;

  const handleMarkRead = async (id: number) => {
    await markAsRead.mutateAsync({ alertId: id });
    queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
    toast({ title: "Alert acknowledged", description: "Alert marked as read." });
  };

  const patients = [...new Set(alerts?.map(a => a.patientName ?? "Unknown") ?? [])];

  const filtered = alerts?.filter(a => {
    const matchSev = severityFilter === "all" || a.severity === severityFilter;
    const matchPat = patientFilter === "all" || (a.patientName ?? "Unknown") === patientFilter;
    return matchSev && matchPat;
  }) ?? [];

  const critical = alerts?.filter(a => a.severity === "critical" && !a.isRead) ?? [];
  const unread = alerts?.filter(a => !a.isRead) ?? [];

  const patientInitial = (name?: string) => (name ?? "?").charAt(0).toUpperCase();
  const patientColor = (name?: string) => PATIENT_COLORS[name ?? ""] ?? "bg-slate-500";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            Emergency Alerts
          </h1>
          <p className="text-muted-foreground mt-1">Patient critical alerts and health warnings requiring attention.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {critical.length > 0 && (
            <Badge className="gap-1.5 bg-destructive animate-pulse px-3 py-1 text-sm">
              <Flame className="h-3.5 w-3.5" /> {critical.length} Critical
            </Badge>
          )}
          {unread.length > 0 && (
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
              {unread.length} Unread
            </Badge>
          )}
        </div>
      </div>

      {/* Summary stat cards */}
      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 bg-destructive rounded-xl flex items-center justify-center shadow-md shadow-red-500/30">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">{alerts?.filter(a => a.severity === "critical").length ?? 0}</div>
                <div className="text-xs text-muted-foreground">Critical Alerts</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 bg-amber-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{alerts?.filter(a => a.severity === "warning").length ?? 0}</div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{alerts?.filter(a => a.isRead).length ?? 0}</div>
                <div className="text-xs text-muted-foreground">Acknowledged</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical Only</SelectItem>
            <SelectItem value="warning">Warnings Only</SelectItem>
          </SelectContent>
        </Select>
        <Select value={patientFilter} onValueChange={setPatientFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        {(severityFilter !== "all" || patientFilter !== "all") && (
          <Button variant="ghost" size="sm" onClick={() => { setSeverityFilter("all"); setPatientFilter("all"); }}>
            Clear filters
          </Button>
        )}
        <span className="text-sm text-muted-foreground ml-auto">{filtered.length} alert{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Alert list */}
      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)
        ) : filtered.length ? (
          filtered.map(alert => (
            <Card key={alert.id} className={cn(
              "overflow-hidden transition-all",
              !alert.isRead ? "border-l-4 shadow-md" : "opacity-60 shadow-sm",
              !alert.isRead && alert.severity === "critical" ? "border-l-destructive bg-destructive/5" : "",
              !alert.isRead && alert.severity === "warning" ? "border-l-amber-500 bg-amber-500/5" : ""
            )}>
              <CardContent className="p-5 flex items-start gap-4">
                {/* Severity icon */}
                <div className={cn(
                  "p-3 rounded-full shrink-0",
                  alert.severity === "critical" ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"
                )}>
                  {alert.severity === "critical" ? <Flame className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  {/* Patient name chip */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-semibold", patientColor(alert.patientName))}>
                      <User className="h-3 w-3" />
                      {alert.patientName ?? "Unknown Patient"}
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] uppercase font-bold",
                      alert.severity === "critical"
                        ? "border-destructive/40 text-destructive bg-destructive/5"
                        : "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400"
                    )}>
                      {alert.severity}
                    </Badge>
                    {!alert.isRead && (
                      <Badge className="text-[10px] h-5 px-1.5 bg-primary">NEW</Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">
                      {new Date(alert.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Alert type */}
                  <h3 className="font-semibold text-sm">
                    {alert.type.replace(/_/g, " ").toUpperCase()}
                  </h3>

                  {/* Message */}
                  <p className="text-sm text-foreground/90 leading-relaxed">{alert.message}</p>

                  {/* Vitals snapshot */}
                  {alert.vitals && (
                    <div className="mt-1 p-2.5 bg-card rounded-lg border text-xs font-mono flex items-start gap-2">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <span className="break-words">{alert.vitals}</span>
                    </div>
                  )}
                </div>

                {/* Acknowledge button */}
                {!alert.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 mt-1 gap-1.5 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    disabled={markAsRead.isPending}
                    onClick={() => handleMarkRead(alert.id)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
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
            <p className="text-muted-foreground">No patient alerts matching the current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
