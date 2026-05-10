import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, CheckCircle, AlertTriangle, TrendingUp, Heart, Activity, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: string;
  title: string;
  description: string;
  severity: string;
  icon: string;
}

interface InsightsData {
  insights: Insight[];
  summary: string;
  score: number | null;
  period: string;
  recordCount: number;
}

function fetchWithAuth(url: string) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
}

const iconMap: Record<string, React.ElementType> = {
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
  "trending-up": TrendingUp,
  "heart": Heart,
  "activity": Activity,
};

const severityConfig = {
  good: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", label: "Good" },
  warning: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", label: "Watch" },
  critical: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", label: "Critical" },
  info: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", label: "Info" },
};

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/20" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-3xl font-bold" style={{ color }}>{score}</div>
        <div className="text-xs text-muted-foreground">/ 100</div>
      </div>
    </div>
  );
}

export default function AiInsights() {
  const { t } = useLanguage();
  const { data, isLoading } = useQuery<InsightsData>({
    queryKey: ["insights"],
    queryFn: () => fetchWithAuth("/api/insights"),
  });

  const goodCount = data?.insights.filter(i => i.severity === "good").length ?? 0;
  const warnCount = data?.insights.filter(i => i.severity === "warning").length ?? 0;
  const critCount = data?.insights.filter(i => i.severity === "critical").length ?? 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            {t("aiInsightsTitle")}
          </h1>
          <p className="text-muted-foreground mt-1">{t("poweredByAI")}</p>
        </div>
        {data && (
          <Badge variant="outline" className="text-xs shrink-0">
            {data.period} • {data.recordCount} {t("readings")}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-8 border-2 border-primary/10">
          <p className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">{t("healthScore")}</p>
          {isLoading ? <Skeleton className="h-36 w-36 rounded-full" /> : data?.score != null ? (
            <ScoreRing score={data.score} />
          ) : (
            <div className="text-center text-muted-foreground">
              <Info className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t("noInsights")}</p>
            </div>
          )}
          {data?.score != null && (
            <p className="text-sm mt-4 font-medium text-center px-4">
              {data.score >= 70
                ? "Your health metrics are looking great!"
                : data.score >= 45
                ? "Some areas need attention."
                : "Please consult your doctor soon."}
            </p>
          )}
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("overallHealth")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">{data?.summary}</p>
            )}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{isLoading ? "–" : goodCount}</div>
                <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-medium">{t("normal")}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{isLoading ? "–" : warnCount}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400 mt-1 font-medium">{t("warning")}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-red-600">{isLoading ? "–" : critCount}</div>
                <div className="text-xs text-red-700 dark:text-red-400 mt-1 font-medium">{t("critical")}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Detailed Insights</h2>
        {!isLoading && !data?.insights?.length && (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed">
            <Brain className="h-12 w-12 text-primary mx-auto mb-4 opacity-30" />
            <p className="font-medium">{t("noInsights")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("recordVitalsFirst")}</p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : data?.insights.map((insight, i) => {
            const config = severityConfig[insight.severity as keyof typeof severityConfig] ?? severityConfig.info;
            const Icon = iconMap[insight.icon] ?? Activity;
            return (
              <div key={i} className={cn("rounded-xl border p-4 flex gap-4 items-start transition-all hover:shadow-md", config.bg, config.border)}>
                <div className={cn("mt-0.5 p-2 rounded-lg bg-white/60 dark:bg-black/20", config.icon)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{insight.title}</p>
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", config.badge)}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
