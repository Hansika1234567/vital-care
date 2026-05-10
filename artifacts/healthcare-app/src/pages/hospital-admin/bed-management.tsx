import { useState } from "react";
import { useGetHospitals } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Bed, ActivitySquare, Zap, TrendingUp, Users, AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const deptBeds = [
  { dept: "General Ward", total: 80, occupied: 62, color: "blue" },
  { dept: "ICU", total: 20, occupied: 16, color: "red" },
  { dept: "Cardiology", total: 25, occupied: 18, color: "pink" },
  { dept: "Orthopedics", total: 30, occupied: 21, color: "amber" },
  { dept: "Pediatrics", total: 20, occupied: 11, color: "green" },
  { dept: "Maternity", total: 15, occupied: 9, color: "purple" },
  { dept: "Neurology", total: 15, occupied: 13, color: "indigo" },
  { dept: "Oncology", total: 12, occupied: 8, color: "orange" },
];

const activity = [
  { time: "2 min ago", event: "Bed G-14 admitted", dept: "General Ward", type: "admit" },
  { time: "8 min ago", event: "ICU-03 discharged", dept: "ICU", type: "discharge" },
  { time: "15 min ago", event: "Emergency transfer to ICU-07", dept: "ICU", type: "transfer" },
  { time: "22 min ago", event: "Bed C-05 cleaned & ready", dept: "Cardiology", type: "ready" },
  { time: "31 min ago", event: "Orthopedics O-12 admitted", dept: "Orthopedics", type: "admit" },
  { time: "45 min ago", event: "P-04 discharged", dept: "Pediatrics", type: "discharge" },
];

const colorMap: Record<string, { bg: string; bar: string; text: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", bar: "bg-blue-500", text: "text-blue-600" },
  red: { bg: "bg-red-50 dark:bg-red-950/30", bar: "bg-red-500", text: "text-red-600" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/30", bar: "bg-pink-500", text: "text-pink-600" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", bar: "bg-amber-500", text: "text-amber-600" },
  green: { bg: "bg-emerald-50 dark:bg-emerald-950/30", bar: "bg-emerald-500", text: "text-emerald-600" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", bar: "bg-purple-500", text: "text-purple-600" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", bar: "bg-indigo-500", text: "text-indigo-600" },
  orange: { bg: "bg-orange-50 dark:bg-orange-950/30", bar: "bg-orange-500", text: "text-orange-600" },
};

export default function BedManagement() {
  const { data: hospitals, isLoading, refetch } = useGetHospitals();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  const totalBeds = deptBeds.reduce((s, d) => s + d.total, 0);
  const totalOccupied = deptBeds.reduce((s, d) => s + d.occupied, 0);
  const totalAvailable = totalBeds - totalOccupied;
  const occupancyRate = Math.round((totalOccupied / totalBeds) * 100);

  const icuDept = deptBeds.find(d => d.dept === "ICU")!;
  const icuRate = Math.round((icuDept.occupied / icuDept.total) * 100);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bed className="h-8 w-8 text-primary" />
            Bed & ICU Management
          </h1>
          <p className="text-muted-foreground mt-1">Real-time bed occupancy, ICU tracking, and department overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs gap-1.5">
            <Clock className="h-3 w-3" />
            Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </Badge>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleRefresh}>
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-blue-100 text-sm font-medium">Total Beds</p>
              <Bed className="h-5 w-5 text-blue-200" />
            </div>
            <div className="text-4xl font-black">{totalBeds}</div>
            <div className="text-blue-200 text-xs mt-1">Across all departments</div>
          </CardContent>
        </Card>
        <Card className={cn("border-0 shadow-lg", occupancyRate > 85 ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/20" : "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20") + " text-white"}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-medium">Occupancy Rate</p>
              <TrendingUp className="h-5 w-5 text-white/70" />
            </div>
            <div className="text-4xl font-black">{occupancyRate}%</div>
            <div className="text-white/70 text-xs mt-1">{totalOccupied} of {totalBeds} beds occupied</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-emerald-100 text-sm font-medium">Available Now</p>
              <CheckCircle className="h-5 w-5 text-emerald-200" />
            </div>
            <div className="text-4xl font-black">{totalAvailable}</div>
            <div className="text-emerald-200 text-xs mt-1">Beds ready for admission</div>
          </CardContent>
        </Card>
        <Card className={cn("border-0 shadow-lg text-white", icuRate > 80 ? "bg-gradient-to-br from-red-600 to-red-700 shadow-red-600/20" : "bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/20")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/80 text-sm font-medium">ICU Occupancy</p>
              <ActivitySquare className="h-5 w-5 text-white/70" />
            </div>
            <div className="text-4xl font-black">{icuRate}%</div>
            <div className="text-white/70 text-xs mt-1">{icuDept.occupied}/{icuDept.total} ICU beds</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Department Bed Status</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {deptBeds.map((dept) => {
              const pct = Math.round((dept.occupied / dept.total) * 100);
              const col = colorMap[dept.color];
              return (
                <Card key={dept.dept} className={cn("border", col.bg)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold text-sm">{dept.dept}</p>
                      <Badge variant="outline" className={cn("text-[10px]", pct > 85 ? "border-red-300 text-red-600 bg-red-50" : pct > 70 ? "border-amber-300 text-amber-600 bg-amber-50" : "border-emerald-300 text-emerald-600 bg-emerald-50")}>
                        {pct > 85 ? <AlertTriangle className="h-3 w-3 mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />}
                        {pct}%
                      </Badge>
                    </div>
                    <Progress value={pct} className="h-2 mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium">{dept.occupied} occupied</span>
                      <span className={cn("font-semibold", col.text)}>{dept.total - dept.occupied} free</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Live Activity Feed</h2>
          <Card>
            <CardContent className="p-0 divide-y">
              {activity.map((a, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", a.type === "admit" ? "bg-blue-500" : a.type === "discharge" ? "bg-emerald-500" : a.type === "transfer" ? "bg-red-500" : "bg-amber-500")} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{a.event}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                      <Badge variant="secondary" className="text-[10px] py-0">{a.dept}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Network Hospitals</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)
              ) : hospitals?.slice(0, 4).map(h => (
                <div key={h.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.bedsAvailable} beds free</p>
                  </div>
                  <Badge variant="outline" className={cn("text-[10px] shrink-0", h.bedsAvailable > 5 ? "border-emerald-300 text-emerald-600" : "border-red-300 text-red-600")}>
                    {h.bedsAvailable > 5 ? "Available" : "Full"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
