import { useState } from "react";
import { useGetPatients, type PatientSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Activity, HeartPulse, Droplets, Phone, BarChart3, User, TrendingUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  normal: "bg-emerald-100 text-emerald-800 border-emerald-200",
  risk: "bg-amber-100 text-amber-800 border-amber-200",
  critical: "bg-red-100 text-red-800 border-red-200 animate-pulse",
};

export default function DoctorPatients() {
  const { data: patients, isLoading } = useGetPatients();
  const [search, setSearch] = useState("");
  const [chartPatient, setChartPatient] = useState<PatientSummary | null>(null);

  const filtered = patients?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.phone ?? "").includes(search)
  ) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Roster</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all assigned patients.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="pl-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {!isLoading && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Patients", value: patients?.length ?? 0, color: "from-blue-500 to-blue-600 shadow-blue-500/20" },
            { label: "Critical", value: patients?.filter(p => p.overallStatus === "critical").length ?? 0, color: "from-red-500 to-red-600 shadow-red-500/20" },
            { label: "At Risk", value: patients?.filter(p => p.overallStatus === "risk").length ?? 0, color: "from-amber-500 to-orange-500 shadow-amber-500/20" },
          ].map(s => (
            <Card key={s.label} className={cn("bg-gradient-to-br text-white border-0 shadow-lg", s.color)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="text-3xl font-black">{s.value}</div>
                <span className="text-white/80 text-sm font-medium">{s.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : filtered.length ? (
          filtered.map((patient) => (
            <Card key={patient.id} className={cn("hover-elevate transition-all overflow-hidden border-l-4",
              patient.overallStatus === "critical" ? "border-l-destructive" :
              patient.overallStatus === "risk" ? "border-l-amber-500" :
              "border-l-emerald-500"
            )}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center p-4 gap-6">
                  <div className="flex items-center gap-4 w-full md:w-1/4 shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base">{patient.name}</h3>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3 w-3" /> {patient.phone || "No phone"}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4 w-full border-y md:border-y-0 md:border-x py-4 md:py-0 md:px-6">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-chart-1" /> HR
                      </div>
                      <div className="font-semibold">{patient.latestHeartRate || "--"} <span className="text-[10px] text-muted-foreground font-normal">bpm</span></div>
                    </div>
                    <div className="text-center border-x">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <HeartPulse className="h-3 w-3 text-chart-2" /> BP
                      </div>
                      <div className="font-semibold">{patient.latestBp || "--"}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-1">
                        <Droplets className="h-3 w-3 text-chart-3" /> SpO2
                      </div>
                      <div className="font-semibold">{patient.latestSpo2 || "--"} <span className="text-[10px] text-muted-foreground font-normal">%</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">Status</div>
                      <Badge variant="outline" className={cn("uppercase text-[10px]", STATUS_COLORS[patient.overallStatus])}>
                        {patient.overallStatus}
                      </Badge>
                    </div>
                    <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => setChartPatient(patient)}>
                      <BarChart3 className="h-3.5 w-3.5" /> View Chart
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <p className="text-lg font-medium text-foreground">No patients found</p>
            <p>{search ? "Try a different search term." : "You have no assigned patients yet."}</p>
          </div>
        )}
      </div>

      <Dialog open={!!chartPatient} onOpenChange={open => !open && setChartPatient(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {chartPatient ? (chartPatient as any).name : ""}'s Health Summary
            </DialogTitle>
          </DialogHeader>
          {chartPatient && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Heart Rate", value: (chartPatient as any).latestHeartRate, unit: "bpm", icon: Activity, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-950/30" },
                  { label: "Blood Pressure", value: (chartPatient as any).latestBp, unit: "", icon: HeartPulse, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
                  { label: "SpO2", value: (chartPatient as any).latestSpo2, unit: "%", icon: Droplets, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-950/30" },
                ].map(v => (
                  <div key={v.label} className={cn("rounded-xl p-3 text-center", v.bg)}>
                    <v.icon className={cn("h-5 w-5 mx-auto mb-2", v.color)} />
                    <div className="text-xl font-black">{v.value ?? "–"}</div>
                    <div className="text-[10px] text-muted-foreground">{v.unit}</div>
                    <div className="text-[10px] font-medium mt-1">{v.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><TrendingUp className="h-4 w-4" /> Overall Status</span>
                  <Badge variant="outline" className={cn("uppercase text-[10px]", STATUS_COLORS[(chartPatient as any).overallStatus])}>
                    {(chartPatient as any).overallStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Phone className="h-4 w-4" /> Phone</span>
                  <span className="font-medium">{(chartPatient as any).phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> Patient ID</span>
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">#{(chartPatient as any).id}</span>
                </div>
              </div>

              {(chartPatient as any).overallStatus === "critical" && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 text-sm text-destructive font-medium text-center">
                  ⚠ Critical status — immediate attention recommended
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
