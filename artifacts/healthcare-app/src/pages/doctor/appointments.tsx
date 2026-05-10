import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetAppointments, useUpdateAppointment, type Appointment, AppointmentUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2, ChevronRight, ClipboardList, Stethoscope } from "lucide-react";
import { format, isToday, isTomorrow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  pending:   "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  completed: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const PATIENT_COLORS: Record<string, string> = {
  "Demo Patient": "bg-blue-500",
  "Pooja":        "bg-purple-500",
  "Test":         "bg-amber-500",
};

function patientColor(name?: string | null) {
  return PATIENT_COLORS[name ?? ""] ?? "bg-slate-500";
}

function formatWhen(date: Date) {
  if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
  if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
  return format(date, "MMM d, yyyy · h:mm a");
}

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useGetAppointments({ userId: user?.id, role: "doctor" });
  const updateAppointment = useUpdateAppointment();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [docNotes, setDocNotes] = useState("");

  const filtered = appointments?.filter(a => filterStatus === "all" || a.status === filterStatus) ?? [];

  const counts = {
    all:       appointments?.length ?? 0,
    pending:   appointments?.filter(a => a.status === "pending").length ?? 0,
    confirmed: appointments?.filter(a => a.status === "confirmed").length ?? 0,
    completed: appointments?.filter(a => a.status === "completed").length ?? 0,
    cancelled: appointments?.filter(a => a.status === "cancelled").length ?? 0,
  };

  // Group: today first, then upcoming, then past
  const todayApts    = filtered.filter(a => isToday(new Date(a.scheduledAt)));
  const upcomingApts = filtered.filter(a => !isToday(new Date(a.scheduledAt)) && !isPast(new Date(a.scheduledAt)));
  const pastApts     = filtered.filter(a => isPast(new Date(a.scheduledAt)) && !isToday(new Date(a.scheduledAt)));

  const handleStatus = async (appointmentId: number, status: string) => {
    try {
      const extraNotes = docNotes.trim() || undefined;
      await updateAppointment.mutateAsync({
        appointmentId,
        data: {
          status: status as AppointmentUpdateStatus,
          ...(extraNotes ? { notes: extraNotes } : {}),
        },
      });
      toast({ title: "Updated", description: `Appointment marked as ${status}.` });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setSelected(null);
      setDocNotes("");
    } catch {
      toast({ title: "Error", description: "Failed to update appointment.", variant: "destructive" });
    }
  };

  const AptCard = ({ apt }: { apt: Appointment }) => {
    const d = new Date(apt.scheduledAt);
    const overdue = isPast(d) && apt.status === "pending";
    return (
      <Card
        className={cn(
          "transition-all hover:shadow-md cursor-pointer border-l-4 group",
          apt.status === "pending"   ? (overdue ? "border-l-destructive" : "border-l-amber-400") :
          apt.status === "confirmed" ? "border-l-emerald-400" :
          apt.status === "completed" ? "border-l-blue-400" :
          "border-l-muted-foreground/30"
        )}
        onClick={() => { setSelected(apt); setDocNotes(apt.notes ?? ""); }}
      >
        <CardContent className="p-4 flex items-center gap-4">
          {/* Patient avatar */}
          <div className={cn(
            "h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm",
            patientColor(apt.patientName)
          )}>
            {(apt.patientName ?? "P").charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm">{apt.patientName ?? "Patient"}</span>
              <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", STATUS_COLORS[apt.status])}>
                {apt.status}
              </Badge>
              {overdue && (
                <Badge variant="destructive" className="text-[10px] animate-pulse">Overdue</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">{apt.reason}</p>
          </div>

          <div className="text-right shrink-0 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 justify-end font-medium text-foreground/80">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatWhen(d)}</span>
            </div>
            {apt.notes && (
              <div className="flex items-center gap-1 justify-end mt-0.5 text-xs">
                <ClipboardList className="h-3 w-3" />
                <span className="truncate max-w-[140px]">{apt.notes}</span>
              </div>
            )}
          </div>

          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
        </CardContent>
      </Card>
    );
  };

  const Section = ({ title, items, empty }: { title: string; items: Appointment[]; empty?: string }) => (
    items.length > 0 ? (
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title} ({items.length})</h3>
        <div className="space-y-2">
          {items.map(a => <AptCard key={a.id} apt={a} />)}
        </div>
      </div>
    ) : null
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            My Schedule
          </h1>
          <p className="text-muted-foreground mt-1">Manage your clinical appointments and patient visits.</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({counts.all})</SelectItem>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="confirmed">Confirmed ({counts.confirmed})</SelectItem>
            <SelectItem value="completed">Completed ({counts.completed})</SelectItem>
            <SelectItem value="cancelled">Cancelled ({counts.cancelled})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total",     value: counts.all,       color: "bg-primary",      text: "text-primary" },
          { label: "Pending",   value: counts.pending,   color: "bg-amber-500",    text: "text-amber-600" },
          { label: "Confirmed", value: counts.confirmed, color: "bg-emerald-500",  text: "text-emerald-600" },
          { label: "Completed", value: counts.completed, color: "bg-blue-500",     text: "text-blue-600" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm", s.color)}>
                {isLoading ? "–" : s.value}
              </div>
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointment groups */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : filtered.length ? (
        <div className="space-y-6">
          <Section title="Today" items={todayApts} />
          <Section title="Upcoming" items={upcomingApts} />
          <Section title="Past" items={pastApts} />
        </div>
      ) : (
        <div className="text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium text-foreground">No appointments</p>
          <p className="text-sm">No {filterStatus !== "all" ? filterStatus : ""} appointments found.</p>
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) { setSelected(null); setDocNotes(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selected && (
                <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0", patientColor(selected.patientName))}>
                  {(selected.patientName ?? "P").charAt(0)}
                </div>
              )}
              <div>
                <div className="text-base font-semibold">{selected?.patientName ?? "Patient"}</div>
                <div className="text-xs text-muted-foreground font-normal">Appointment Details</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</p>
                  <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold", STATUS_COLORS[selected.status])}>
                    {selected.status}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Scheduled</p>
                  <p className="font-semibold text-xs leading-snug">{formatWhen(new Date(selected.scheduledAt))}</p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-3 text-sm">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Reason for Visit</p>
                <p className="leading-relaxed">{selected.reason}</p>
              </div>

              {selected.status !== "completed" && selected.status !== "cancelled" && (
                <div className="space-y-2">
                  <Label htmlFor="docNotes" className="text-xs font-semibold uppercase text-muted-foreground">
                    Doctor's Notes (optional)
                  </Label>
                  <Textarea
                    id="docNotes"
                    placeholder="Add clinical notes, prescriptions, or instructions..."
                    value={docNotes}
                    onChange={e => setDocNotes(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>
              )}

              {selected.notes && (selected.status === "completed" || selected.status === "cancelled") && (
                <div className="bg-muted/50 rounded-xl p-3 text-sm">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Notes</p>
                  <p className="leading-relaxed text-foreground/90">{selected.notes}</p>
                </div>
              )}
            </div>
          )}

          {selected && selected.status !== "completed" && selected.status !== "cancelled" && (
            <DialogFooter className="gap-2 flex-wrap sm:flex-nowrap">
              {selected.status === "pending" && (
                <Button
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 flex-1"
                  disabled={updateAppointment.isPending}
                  onClick={() => handleStatus(selected.id, "confirmed")}
                >
                  {updateAppointment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Confirm Appointment
                </Button>
              )}
              {selected.status === "confirmed" && (
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700 flex-1"
                  disabled={updateAppointment.isPending}
                  onClick={() => handleStatus(selected.id, "completed")}
                >
                  {updateAppointment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Mark as Completed
                </Button>
              )}
              <Button
                variant="outline"
                className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                disabled={updateAppointment.isPending}
                onClick={() => handleStatus(selected.id, "cancelled")}
              >
                <XCircle className="h-4 w-4" /> Cancel
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
