import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetVitalTrends } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, HeartPulse, Droplets, Thermometer, Flame, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Button } from "@/components/ui/button";

const PERIODS = ["daily", "weekly", "monthly"] as const;

const VITALS = [
  {
    key: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    icon: Activity,
    color: "#f43f5e",
    gradientFrom: "#f43f5e",
    gradientTo: "#fb7185",
    refLines: [{ y: 60, label: "Min" }, { y: 100, label: "Max" }],
    domain: ["dataMin - 10", "dataMax + 10"] as [string, string],
    normal: "60–100 bpm",
  },
  {
    key: "spo2",
    label: "SpO₂",
    unit: "%",
    icon: Droplets,
    color: "#3b82f6",
    gradientFrom: "#3b82f6",
    gradientTo: "#60a5fa",
    refLines: [{ y: 95, label: "Min safe" }],
    domain: [90, 100] as [number, number],
    normal: "95–100%",
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    color: "#f97316",
    gradientFrom: "#f97316",
    gradientTo: "#fb923c",
    refLines: [{ y: 37.2, label: "High" }],
    domain: ["dataMin - 0.5", "dataMax + 0.5"] as [string, string],
    normal: "36.1–37.2 °C",
  },
  {
    key: "glucose",
    label: "Glucose",
    unit: "mg/dL",
    icon: Flame,
    color: "#a855f7",
    gradientFrom: "#a855f7",
    gradientTo: "#c084fc",
    refLines: [{ y: 70, label: "Low" }, { y: 140, label: "High" }],
    domain: ["dataMin - 10", "dataMax + 10"] as [string, string],
    normal: "70–140 mg/dL",
  },
];

const BP_COLORS = {
  systolic: { line: "#10b981", gradient: ["#10b981", "#34d399"] },
  diastolic: { line: "#06b6d4", gradient: ["#06b6d4", "#22d3ee"] },
};

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card shadow-xl px-4 py-3 text-sm min-w-[120px]">
      <p className="font-semibold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground ml-auto pl-2">{p.value}{unit ? ` ${unit}` : ""}</span>
        </div>
      ))}
    </div>
  );
};

export default function PatientAnalytics() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<typeof PERIODS[number]>("weekly");
  const { data, isLoading } = useGetVitalTrends({ userId: user?.id, period });

  const chartData = data?.labels.map((label, i) => ({
    label,
    heartRate: data.heartRate[i],
    systolicBp: data.systolicBp[i],
    diastolicBp: data.diastolicBp[i],
    spo2: data.spo2[i],
    glucose: data.glucose[i],
    temperature: data.temperature[i],
  })) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          </div>
          <p className="text-muted-foreground">Visual trends of your vital signs over time.</p>
        </div>
        <div className="flex gap-1.5 bg-muted/60 p-1 rounded-xl">
          {PERIODS.map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? "default" : "ghost"}
              className={`capitalize rounded-lg h-8 px-4 text-sm font-medium transition-all ${period === p ? "shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              onClick={() => setPeriod(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Blood Pressure — full width */}
      <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-emerald-50/60 via-white to-cyan-50/60 dark:from-emerald-950/20 dark:via-card dark:to-cyan-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-md">
                <HeartPulse className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Blood Pressure</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Normal: 90/60 – 120/80 mmHg</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full inline-block" style={{ background: "#10b981" }} /> Systolic</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-full inline-block" style={{ background: "#06b6d4" }} /> Diastolic</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-[260px] w-full rounded-xl" /> : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradSystolic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDiastolic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} domain={["dataMin - 10", "dataMax + 10"]} />
                  <Tooltip content={<CustomTooltip unit="mmHg" />} />
                  <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
                  <Area type="monotone" dataKey="systolicBp" name="Systolic" stroke="#10b981" strokeWidth={3} fill="url(#gradSystolic)" dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }} />
                  <Area type="monotone" dataKey="diastolicBp" name="Diastolic" stroke="#06b6d4" strokeWidth={3} fill="url(#gradDiastolic)" dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#06b6d4" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2×2 vitals grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {VITALS.map(({ key, label, unit, icon: Icon, color, gradientFrom, gradientTo, refLines, domain, normal }) => {
          const gradId = `grad_${key}`;
          const cardGradients: Record<string, string> = {
            heartRate: "from-rose-50/60 via-white to-pink-50/40 dark:from-rose-950/20 dark:via-card dark:to-pink-950/10",
            spo2: "from-blue-50/60 via-white to-indigo-50/40 dark:from-blue-950/20 dark:via-card dark:to-indigo-950/10",
            temperature: "from-orange-50/60 via-white to-amber-50/40 dark:from-orange-950/20 dark:via-card dark:to-amber-950/10",
            glucose: "from-purple-50/60 via-white to-violet-50/40 dark:from-purple-950/20 dark:via-card dark:to-violet-950/10",
          };
          const iconGradients: Record<string, string> = {
            heartRate: "from-rose-400 to-pink-500",
            spo2: "from-blue-400 to-indigo-500",
            temperature: "from-orange-400 to-amber-500",
            glucose: "from-purple-400 to-violet-500",
          };

          return (
            <Card key={key} className={`overflow-hidden border-0 shadow-lg bg-gradient-to-br ${cardGradients[key]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${iconGradients[key]} flex items-center justify-center shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{label}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">Normal: {normal}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? <Skeleton className="h-[220px] w-full rounded-xl" /> : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                        <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} domain={domain as any} />
                        <Tooltip content={<CustomTooltip unit={unit} />} />
                        {refLines.map((r) => (
                          <ReferenceLine key={r.y} y={r.y} stroke="#f59e0b" strokeDasharray="4 4" strokeOpacity={0.6} />
                        ))}
                        <Area
                          type="monotone"
                          dataKey={key}
                          name={label}
                          stroke={color}
                          strokeWidth={3}
                          fill={`url(#${gradId})`}
                          dot={false}
                          activeDot={{ r: 6, strokeWidth: 0, fill: color }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
