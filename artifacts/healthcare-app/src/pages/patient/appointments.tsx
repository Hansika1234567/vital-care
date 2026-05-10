import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetAppointments, useCreateAppointment, useUpdateAppointment } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, User, Plus, Loader2, XCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(opts.headers || {}) } });
}

export default function PatientAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: appointments, isLoading } = useGetAppointments({ userId: user?.id, role: "patient" });
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const [isOpen, setIsOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [formData, setFormData] = useState({
    doctorId: "2",
    date: "",
    time: "",
    reason: "",
    notes: ""
  });

  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`).toISOString();
      await createAppointment.mutateAsync({
        data: {
          doctorId: parseInt(formData.doctorId),
          scheduledAt,
          reason: formData.reason,
          notes: formData.notes
        }
      });
      toast({ title: "Appointment booked", description: "Your appointment has been scheduled." });
      setIsOpen(false);
      setFormData({ doctorId: "2", date: "", time: "", reason: "", notes: "" });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to book appointment", variant: "destructive" });
    }
  };

  const handleCancel = async (appointmentId: number) => {
    try {
      await updateAppointment.mutateAsync({ appointmentId, data: { status: "cancelled" } });
      toast({ title: "Appointment cancelled", description: "Your appointment has been cancelled." });
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to cancel appointment", variant: "destructive" });
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleId) return;
    setIsRescheduling(true);
    try {
      const scheduledAt = new Date(`${rescheduleData.date}T${rescheduleData.time}`).toISOString();
      const res = await authFetch(`/api/appointments/${rescheduleId}`, {
        method: "PATCH",
        body: JSON.stringify({ scheduledAt }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Appointment rescheduled", description: "Your appointment has been updated." });
      setRescheduleId(null);
      invalidate();
    } catch {
      toast({ title: "Error", description: "Failed to reschedule appointment", variant: "destructive" });
    } finally {
      setIsRescheduling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled": return "bg-muted text-muted-foreground border-border";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage your upcoming and past doctor visits.</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0"><Plus className="mr-2 h-4 w-4" /> Book Appointment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book an Appointment</DialogTitle>
              <DialogDescription>Schedule a visit with your preferred doctor.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for visit</Label>
                <Input id="reason" required placeholder="e.g. Annual checkup" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional notes</Label>
                <Textarea id="notes" placeholder="Any specific symptoms?" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createAppointment.isPending}>
                  {createAppointment.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirm Booking
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleId !== null} onOpenChange={open => !open && setRescheduleId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>Choose a new date and time.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReschedule} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Date</Label>
                <Input type="date" required value={rescheduleData.date} onChange={e => setRescheduleData(d => ({...d, date: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>New Time</Label>
                <Input type="time" required value={rescheduleData.time} onChange={e => setRescheduleData(d => ({...d, time: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setRescheduleId(null)}>Cancel</Button>
              <Button type="submit" disabled={isRescheduling}>
                {isRescheduling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : appointments?.length ? (
          appointments.map((apt) => (
            <Card key={apt.id} className="hover-elevate transition-all">
              <CardContent className="p-6 flex flex-col h-full justify-between gap-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className={cn("uppercase text-xs font-semibold tracking-wider", getStatusColor(apt.status))}>
                      {apt.status}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-1">{apt.reason}</h3>
                    <div className="flex items-center text-muted-foreground text-sm gap-2">
                      <User className="h-4 w-4" />
                      <span>{apt.doctorName || "Dr. Unassigned"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-muted/50 p-3 rounded-lg text-sm border">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{format(new Date(apt.scheduledAt), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">{format(new Date(apt.scheduledAt), "h:mm a")}</span>
                    </div>
                  </div>
                </div>

                {apt.status === "pending" && (
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      className="w-full gap-1.5"
                      size="sm"
                      onClick={() => {
                        setRescheduleData({ date: "", time: "" });
                        setRescheduleId(apt.id);
                      }}
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Reschedule
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10 gap-1.5" size="sm">
                          <XCircle className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will cancel your appointment for "{apt.reason}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep It</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => handleCancel(apt.id)}
                          >
                            Yes, Cancel
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No appointments found</p>
            <p>You have no upcoming or past appointments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
