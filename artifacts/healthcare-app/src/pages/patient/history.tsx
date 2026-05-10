import { useAuth } from "@/hooks/use-auth";
import { useGetVitalHistory } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Droplets, Flame, HeartPulse, Thermometer, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function VitalsHistory() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data, isLoading } = useGetVitalHistory({ userId: user?.id });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
      case "risk": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50";
      case "critical": return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50 animate-pulse";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("vitalsHistory")}</h1>
        <p className="text-muted-foreground mt-1">{t("chronologicalTimeline")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("totalRecords")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.records?.length || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("totalAlerts")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data?.alertCount || 0}</div>}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("criticalReadings")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-destructive">{data?.criticalCount || 0}</div>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("timeline")}</CardTitle>
          <CardDescription>{t("yourMeasurements")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-muted shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" />
                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4"><Skeleton className="h-24 w-full" /></Card>
                </div>
              ))
            ) : data?.records?.length ? (
              data.records.map((record) => (
                <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                    record.status === "critical" ? "bg-destructive text-destructive-foreground" :
                    record.status === "risk" ? "bg-amber-500 text-white" :
                    "bg-primary text-primary-foreground"
                  )}>
                    <Activity className="h-4 w-4" />
                  </div>

                  <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover-elevate transition-all hover:border-primary/50">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                      <div className="font-semibold text-sm">{new Date(record.createdAt).toLocaleString()}</div>
                      <Badge variant="outline" className={getStatusColor(record.status)}>
                        {record.status === "normal" ? t("normal") : record.status === "risk" ? t("risk") : t("critical")}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-y-2 text-sm mt-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Activity className="h-3.5 w-3.5 text-chart-1"/> HR: <span className="text-foreground font-medium">{record.heartRate}</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><HeartPulse className="h-3.5 w-3.5 text-chart-2"/> BP: <span className="text-foreground font-medium">{record.systolicBp}/{record.diastolicBp}</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Droplets className="h-3.5 w-3.5 text-chart-3"/> SpO2: <span className="text-foreground font-medium">{record.spo2}%</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Thermometer className="h-3.5 w-3.5 text-chart-4"/> Temp: <span className="text-foreground font-medium">{record.temperature}°</span></div>
                        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2"><Info className="h-3.5 w-3.5 text-chart-5"/> Glu: <span className="text-foreground font-medium">{record.glucose}</span></div>
                      </div>
                      {record.notes && (
                        <div className="mt-3 text-sm border-t pt-2 text-muted-foreground italic">
                          "{record.notes}"
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-lg border">{t("noRecords")}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
