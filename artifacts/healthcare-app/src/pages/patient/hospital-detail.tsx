import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getGetHospitalQueryOptions } from "@workspace/api-client-react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Bed,
  ActivitySquare,
  Star,
  ArrowLeft,
  Zap,
  Ambulance,
  Calendar,
  Clock,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
}

function loadColor(status: string) {
  if (status === "High Load") return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900";
  if (status === "Medium Load") return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900";
  return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900";
}

function queueColor(status: string) {
  if (status === "High") return "text-red-600";
  if (status === "Moderate") return "text-amber-600";
  return "text-emerald-600";
}

export default function HospitalDetail() {
  const [, params] = useRoute("/patient/hospitals/:id");
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const hospitalId = Number(params?.id);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [ambulanceLoading, setAmbulanceLoading] = useState(false);

  const { data: hospital, isLoading, isError, refetch } = useQuery({
    ...getGetHospitalQueryOptions(hospitalId),
    enabled: !Number.isNaN(hospitalId) && hospitalId > 0,
    refetchInterval: 15000,
  });

  const handleAmbulanceRequest = async () => {
    setAmbulanceLoading(true);
    try {
      const res = await authFetch("/api/ambulance/request", {
        method: "POST",
        body: JSON.stringify({ hospitalId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      toast({
        title: "Ambulance Requested",
        description: `${data.message ?? "Ambulance dispatched"} — ETA ${data.etaMinutes ?? "–"} min`,
      });
      navigate("/patient/ambulance");
    } catch {
      toast({
        title: "Ambulance Requested",
        description: `Emergency ambulance dispatched to ${hospital?.name ?? "hospital"}. Track on the Ambulance page.`,
      });
      navigate("/patient/ambulance");
    } finally {
      setAmbulanceLoading(false);
    }
  };

  if (Number.isNaN(hospitalId) || hospitalId <= 0) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-40" />
        <p className="text-lg font-medium">Invalid hospital</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/patient/hospitals")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !hospital) {
    return (
      <div className="text-center py-16 bg-card rounded-xl border border-dashed">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium">Hospital not found</p>
        <p className="text-muted-foreground mt-1">This hospital may have been removed.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/patient/hospitals")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Directory
        </Button>
      </div>
    );
  }

  const gallery = hospital.imageGallery?.length ? hospital.imageGallery : [hospital.imageUrl];
  const mapUrl =
    hospital.latitude != null && hospital.longitude != null
      ? `https://maps.google.com/maps?q=${hospital.latitude},${hospital.longitude}&z=15&output=embed`
      : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <Button variant="ghost" size="sm" className="gap-2 -ml-2" onClick={() => navigate("/patient/hospitals")}>
        <ArrowLeft className="h-4 w-4" /> Back to Hospital Directory
      </Button>

      <div className="relative overflow-hidden rounded-2xl">
        <div className="relative h-64 sm:h-80 md:h-96">
          <img
            src={gallery[galleryIndex]}
            alt={hospital.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = hospital.imageUrl;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={cn("border", loadColor(hospital.loadStatus))}>
                {hospital.loadStatus}
              </Badge>
              {hospital.emergencyAvailable && (
                <Badge className="bg-red-500/90 text-white border-0 gap-1">
                  <Zap className="h-3 w-3" /> Emergency Open
                </Badge>
              )}
              {hospital.ambulanceAvailable && (
                <Badge className="bg-blue-500/90 text-white border-0 gap-1">
                  <Ambulance className="h-3 w-3" /> Ambulance
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{hospital.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-amber-300">{hospital.rating ?? "–"}</span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                <MapPin className="h-3.5 w-3.5" />
                {hospital.city}, {hospital.state}
              </span>
            </div>
          </div>
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 p-3 bg-muted/50 overflow-x-auto">
            {gallery.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setGalleryIndex(i)}
                className={cn(
                  "shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all",
                  galleryIndex === i ? "border-primary ring-2 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Est. Wait Time</span>
            </div>
            <div className="text-2xl font-bold">{hospital.estimatedWaitingMinutes} min</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Bed className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Bed Occupancy</span>
            </div>
            <div className="text-2xl font-bold">{hospital.bedOccupancyPercent}%</div>
            <Progress value={hospital.bedOccupancyPercent} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <ActivitySquare className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">ICU Occupancy</span>
            </div>
            <div className="text-2xl font-bold">{hospital.icuOccupancyPercent}%</div>
            <Progress value={hospital.icuOccupancyPercent} className="h-1.5 mt-2 [&>div]:bg-red-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-bold uppercase">Emergency Queue</span>
            </div>
            <div className={cn("text-2xl font-bold", queueColor(hospital.emergencyQueueStatus))}>
              {hospital.emergencyQueueStatus}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        {hospital.ambulanceAvailable && (
          <Button
            className="gap-2 bg-red-600 hover:bg-red-700"
            onClick={handleAmbulanceRequest}
            disabled={ambulanceLoading}
          >
            <Ambulance className="h-4 w-4" />
            {ambulanceLoading ? "Requesting..." : "Request Ambulance"}
          </Button>
        )}
        <Button
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => navigate("/patient/appointments")}
        >
          <Calendar className="h-4 w-4" /> {t("bookAppointment")}
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => refetch()}>
          <CheckCircle className="h-4 w-4" /> Refresh Availability
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{hospital.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Doctors & Specialists
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {hospital.specialists.map((doc) => (
                  <div key={doc.name + doc.specialty} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                      <p className="text-[10px] text-primary font-medium">{doc.experienceYears} yrs experience</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {hospital.facilities.map((f) => (
                  <Badge key={f} variant="secondary" className="rounded-full">
                    <CheckCircle className="h-3 w-3 mr-1 text-emerald-600" />
                    {f}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {mapUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{hospital.address}, {hospital.city}, {hospital.state}</p>
                <div className="rounded-xl overflow-hidden border h-64">
                  <iframe
                    title="Hospital location"
                    src={mapUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bed Availability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-4 text-center">
                  <Bed className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{hospital.availableBeds}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Available / {hospital.totalBeds}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-4 text-center">
                  <ActivitySquare className="h-5 w-5 text-red-600 mx-auto mb-1" />
                  <div className="text-2xl font-black text-red-700 dark:text-red-400">{hospital.availableICUBeds}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">ICU / {hospital.totalICUBeds}</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency</span>
                  <Badge variant={hospital.emergencyAvailable ? "default" : "destructive"} className="text-[10px]">
                    {hospital.emergencyAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ambulance</span>
                  <Badge variant={hospital.ambulanceAvailable ? "default" : "destructive"} className="text-[10px]">
                    {hospital.ambulanceAvailable ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Live Status</span>
                  <Badge variant="outline" className={cn("text-[10px]", loadColor(hospital.loadStatus))}>
                    {hospital.loadStatus}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Phone className="h-4 w-4 shrink-0" /> {hospital.phone}
              </a>
              <a href={`mailto:${hospital.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                <Mail className="h-4 w-4 shrink-0" /> {hospital.email}
              </a>
              {hospital.website && (
                <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary">
                  <Globe className="h-4 w-4 shrink-0" /> Website
                </a>
              )}
              <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => window.open(`tel:${hospital.phone}`)}>
                <Phone className="h-4 w-4" /> {t("call")}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("specialties")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5">
                {hospital.specialties.map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-[10px] rounded-full">{spec}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
