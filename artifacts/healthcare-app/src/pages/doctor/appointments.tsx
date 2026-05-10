import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetAppointments, useUpdateAppointment, type Appointment, AppointmentUpdateStatus } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: appointments, isLoading } = useGetAppointments({ userId: user?.id, role: "doctor" });
  const updateAppointment = useUpdateAppointment();
  const [filterStatus, setFilterStatus] = useState("all");
  const [selected, setSelected] = useState<Appointment | null>(null);

  const filtered = appointments?.filter(a => filterStatus === "all" || a.status === filterStatus) ?? [];

  const counts = {
    all: appointments?.length ?? 0,
    pending: appointments?.filter(a => a.status === "pending").length ?? 0,
    confirmed: appointments?.filter(a => a.status === "confirmed").length ?? 0,
    completed: appointments?.filter(a => a.status === "completed").length ?? 0,
  };

  const handleStatus = async (appointmentId: number, status: string) => {
    try {
      await updateAppointment.mutateAsync({ appointmentId, data: { status: status as AppointmentUpdateStatus } });
      toast({ title: "Status updated", description: `Appointment marked as ${status}.` });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setSelected(null);
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your clinical appointments and patient visits.</p>
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({counts.all})</SelectItem>
            <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
            <SelectItem value="confirmed">Confirmed ({counts.confirmed})</SelectItem>
            <SelectItem value="completed">Completed ({counts.completed})</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: counts.all, color: "bg-blue-500" },
          { label: "Pending", value: counts.pending, color: "bg-amber-500" },
          { label: "Confirmed", value: counts.confirmed, color: "bg-emerald-500" },
          { label: "Completed", value: counts.completed, color: "bg-indigo-500" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg", s.color)}>{s.value}</div>
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
        ) : filtered.length ? (
          filtered.map(apt => (
            <Card
              key={apt.id}
              className={cn("transition-all hover:shadow-md cursor-pointer border-l-4",
                apt.status === "pending" ? "border-l-amber-400" :
                apt.status === "confirmed" ? "border-l-emerald-400" :
                apt.status === "completed" ? "border-l-blue-400" :
                "border-l-muted-foreground/30"
              )}
              onClick={() => setSelected(apt)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0">
                  {(apt.patientName ?? "P").charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm">{apt.patientName ?? "Patient"}</span>
                    <Badge variant="outline" className={cn("text-[10px] uppercase", STATUS_COLORS[apt.status])}>
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{apt.reason}</p>
                </div>
                <div className="text-right shrink-0 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1 justify-end">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No appointments</p>
            <p className="text-sm">No {filterStatus !== "all" ? filterStatus : ""} appointments found.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Appointment Details
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Patient</p>
                  <p className="font-semibold">{selected.patientName ?? "Patient"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={cn("text-[10px] uppercase", STATUS_COLORS[selected.status])}>
                    {selected.status}
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <p className="font-semibold">{format(new Date(selected.scheduledAt), "MMM d, yyyy")}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="font-semibold">{format(new Date(selected.scheduledAt), "h:mm a")}</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p className="text-xs text-muted-foreground mb-1">Reason</p>
                <p>{selected.reason}</p>
              </div>
              {selected.notes && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p>{selected.notes}</p>
                </div>
              )}
            </div>
          )}
          {selected && selected.status !== "completed" && selected.status !== "cancelled" && (
            <DialogFooter className="gap-2 flex-wrap">
              {selected.status === "pending" && (
                <Button
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  disabled={updateAppointment.isPending}
                  onClick={() => handleStatus(selected.id, "confirmed")}
                >
                  {updateAppointment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Confirm
                </Button>
              )}
              {selected.status === "confirmed" && (
                <Button
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                  disabled={updateAppointment.isPending}
                  onClick={() => handleStatus(selected.id, "completed")}
                >
                  {updateAppointment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Mark Complete
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
