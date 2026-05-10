import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search, UserCog, Phone, Mail } from "lucide-react";

interface Doctor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
}

function authFetch(url: string, opts: RequestInit = {}) {
  const token = localStorage.getItem("healthcare_token");
  return fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  }).then(r => r.json());
}

export default function AdminDoctors() {
  const [search, setSearch] = useState("");

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
    queryFn: () => authFetch("/api/doctors"),
  });

  const filtered = doctors?.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Medical Staff</h1>
          <p className="text-muted-foreground mt-1">All registered doctors and clinical staff.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <UserCog className="h-3.5 w-3.5 mr-1.5" />
              {doctors?.length ?? 0} doctors
            </Badge>
          )}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search doctors..."
              className="pl-9 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)
        ) : filtered.length > 0 ? (
          filtered.map((doctor) => (
            <Card key={doctor.id} className="hover-elevate transition-all">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg shrink-0">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{doctor.name}</h3>
                    <Badge variant="outline" className="text-[10px] mt-1 bg-blue-50 text-blue-700 border-blue-200">
                      {doctor.role === "doctor" ? "Physician" : doctor.role}
                    </Badge>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{doctor.email}</span>
                      </div>
                      {doctor.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{doctor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-16 bg-card rounded-xl border border-dashed text-muted-foreground">
            <UserCog className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-foreground">No doctors found</p>
            <p className="text-sm">Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
