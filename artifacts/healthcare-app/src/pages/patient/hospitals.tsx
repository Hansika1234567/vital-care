import { useState } from "react";
import { useGetHospitals } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Building2, Bed, ActivitySquare, Star, Search, Zap, Shield, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const hospitalImages = [
  "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80",
  "https://images.unsplash.com/photo-1551884831-bbf3cdc6469e?w=600&q=80",
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&q=80",
  "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80",
];

export default function HospitalsList() {
  const { data: hospitals, isLoading } = useGetHospitals();
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");

  const allSpecialties = hospitals
    ? [...new Set(hospitals.flatMap(h => h.specialties))]
    : [];

  const filtered = hospitals?.filter(h => {
    const matchName = h.name.toLowerCase().includes(search.toLowerCase()) || h.address.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "all" || h.specialties.includes(specialty);
    return matchName && matchSpec;
  });

  const topRated = filtered?.filter(h => (Number(h.rating) || 0) >= 4.5);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 p-8 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&q=30')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700/90 to-indigo-900/80" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-5 w-5" />
            <span className="text-blue-200 text-sm font-medium">Trusted Hospital Network</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Find the Best Hospitals</h1>
          <p className="text-blue-100 max-w-lg mb-6">Access premium healthcare facilities near you. Real-time bed availability, ICU status, and instant appointment booking.</p>
          <div className="flex gap-4 flex-wrap">
            <div className="relative flex-1 min-w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
              <Input placeholder="Search hospitals, locations..." className="pl-10 h-11 bg-white/15 border-white/30 text-white placeholder:text-blue-200 focus-visible:ring-white/30 focus-visible:bg-white/20" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-48 h-11 bg-white/15 border-white/30 text-white">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {allSpecialties.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Bed className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{isLoading ? "–" : hospitals?.reduce((s, h) => s + h.bedsAvailable, 0)}</div>
              <div className="text-xs text-muted-foreground">Total Available Beds</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-red-500 rounded-xl flex items-center justify-center shadow-md shadow-red-500/30">
              <ActivitySquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">{isLoading ? "–" : hospitals?.reduce((s, h) => s + h.icuAvailable, 0)}</div>
              <div className="text-xs text-muted-foreground">ICU Beds Available</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{isLoading ? "–" : hospitals?.length}</div>
              <div className="text-xs text-muted-foreground">Partner Hospitals</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {!isLoading && topRated && topRated.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            <h2 className="text-xl font-bold">Top Rated</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {topRated.slice(0, 3).map((hospital, idx) => (
              <HospitalCard key={hospital.id} hospital={hospital} imgIndex={idx} featured />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">All Hospitals {filtered?.length ? `(${filtered.length})` : ""}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
          ) : filtered?.length ? (
            filtered.map((hospital, idx) => <HospitalCard key={hospital.id} hospital={hospital} imgIndex={idx + 3} />)
          ) : (
            <div className="col-span-full text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-foreground">No hospitals found</p>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HospitalCard({ hospital, imgIndex, featured }: {
  hospital: {
    id: number;
    name: string;
    address: string;
    phone: string;
    rating?: number | null;
    distance?: string | null;
    bedsAvailable: number;
    icuAvailable: number;
    specialties: string[];
  };
  imgIndex: number;
  featured?: boolean;
}) {
  const [, navigate] = useLocation();
  const img = hospitalImages[imgIndex % hospitalImages.length];
  const isEmergency = hospital.bedsAvailable > 5;

  return (
    <Card className={cn("group overflow-hidden rounded-2xl border-0 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer", featured && "ring-2 ring-amber-400/50 ring-offset-2")}>
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&q=80"; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          {isEmergency && (
            <Badge className="bg-red-500/90 text-white text-[10px] gap-1 border-0 backdrop-blur-sm">
              <Zap className="h-3 w-3" /> Emergency
            </Badge>
          )}
          {featured && (
            <Badge className="bg-amber-400/90 text-amber-900 text-[10px] gap-1 border-0 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-amber-900" /> Top Rated
            </Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow">{hospital.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="text-amber-300 text-sm font-semibold">{hospital.rating ?? "–"}</span>
            {hospital.distance && <span className="text-white/60 text-xs ml-1">• {hospital.distance}</span>}
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex-1 flex flex-col gap-4 bg-card">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span className="line-clamp-2">{hospital.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-primary shrink-0" />
            <span>{hospital.phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Bed className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wide">Beds</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{hospital.bedsAvailable}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
              <ActivitySquare className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wide">ICU</span>
            </div>
            <div className="text-2xl font-black text-red-700 dark:text-red-400">{hospital.icuAvailable}</div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Specialties</p>
          <div className="flex flex-wrap gap-1.5">
            {hospital.specialties.map(spec => (
              <Badge key={spec} variant="secondary" className="text-[10px] font-medium rounded-full">{spec}</Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => window.open(`tel:${hospital.phone}`)}>
            <Phone className="h-3.5 w-3.5" /> Call
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0" onClick={() => navigate("/appointments")}>
            <Calendar className="h-3.5 w-3.5" /> Book Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
