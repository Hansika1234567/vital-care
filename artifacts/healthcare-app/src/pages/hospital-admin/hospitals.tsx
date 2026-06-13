import { useQuery } from "@tanstack/react-query";
import { getGetHospitalsQueryOptions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, Phone, Bed, ActivitySquare, Star } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&q=80";

export default function AdminHospitals() {
  const { data: hospitals, isLoading, isError, refetch } = useQuery({
    ...getGetHospitalsQueryOptions(),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Hospital Network</h1>
          <p className="text-muted-foreground mt-1">Manage all hospitals and facilities in the network.</p>
        </div>
        {!isLoading && (
          <Badge variant="secondary" className="text-sm px-3 py-1">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            {hospitals?.length ?? 0} facilities
          </Badge>
        )}
      </div>

      {isError && (
        <Card className="border-red-200">
          <CardContent className="p-4 text-sm text-red-600">
            Failed to load hospitals.{" "}
            <button type="button" className="underline font-medium" onClick={() => refetch()}>Retry</button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)
        ) : hospitals?.length ? (
          hospitals.map((hospital) => (
            <Card key={hospital.id} className="hover-elevate transition-all overflow-hidden">
              <div className="relative h-32">
                <img
                  src={hospital.imageUrl || FALLBACK_IMAGE}
                  alt={hospital.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{hospital.name}</h3>
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{hospital.rating ?? "–"}</span>
                  <span className="text-muted-foreground">• {hospital.city}</span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{hospital.phone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2">
                    <Bed className="h-3.5 w-3.5 text-emerald-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{hospital.availableBeds}</div>
                    <div className="text-[10px] text-muted-foreground">/{hospital.totalBeds} beds</div>
                  </div>
                  <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                    <ActivitySquare className="h-3.5 w-3.5 text-red-600 mx-auto mb-1" />
                    <div className="text-lg font-bold text-red-700 dark:text-red-400">{hospital.availableICUBeds}</div>
                    <div className="text-[10px] text-muted-foreground">/{hospital.totalICUBeds} ICU</div>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>ID #{hospital.id}</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No hospitals found</p>
            <p className="text-sm mt-1">Run the seed script to populate hospital data.</p>
          </div>
        )}
      </div>
    </div>
  );
}
