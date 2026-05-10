import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateVital } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HeartPulse, Activity, Droplets, Thermometer, Info } from "lucide-react";

export default function RecordVitals() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const createVital = useCreateVital();

  const [formData, setFormData] = useState({
    heartRate: "",
    systolicBp: "",
    diastolicBp: "",
    spo2: "",
    glucose: "",
    temperature: "",
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVital.mutateAsync({
        data: {
          heartRate: Number(formData.heartRate),
          systolicBp: Number(formData.systolicBp),
          diastolicBp: Number(formData.diastolicBp),
          spo2: Number(formData.spo2),
          glucose: Number(formData.glucose),
          temperature: Number(formData.temperature),
          notes: formData.notes || undefined
        }
      });
      toast({ title: t("vitalsSuccess") });
      queryClient.invalidateQueries({ queryKey: ["/api/vitals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vitals/latest"] });
      setLocation("/patient/history");
    } catch {
      toast({ title: t("vitalsFail"), variant: "destructive" });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("recordVitalsTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("enterMeasurements")}</p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>{t("healthMeasurements")}</CardTitle>
          <CardDescription>{t("allFieldsRequired")}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="heartRate" className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-chart-1" />
                  {t("heartRateBpm")}
                </Label>
                <Input id="heartRate" name="heartRate" type="number" required placeholder="e.g. 72" value={formData.heartRate} onChange={handleChange} className="h-11" />
              </div>

              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-chart-2" />
                  {t("bloodPressureMmhg")}
                </Label>
                <div className="flex items-center gap-2">
                  <Input id="systolicBp" name="systolicBp" type="number" required placeholder="Sys (120)" value={formData.systolicBp} onChange={handleChange} className="h-11" />
                  <span className="text-2xl font-light text-muted-foreground">/</span>
                  <Input id="diastolicBp" name="diastolicBp" type="number" required placeholder="Dia (80)" value={formData.diastolicBp} onChange={handleChange} className="h-11" />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="spo2" className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-chart-3" />
                  {t("bloodOxygen")}
                </Label>
                <Input id="spo2" name="spo2" type="number" required placeholder="e.g. 98" value={formData.spo2} onChange={handleChange} className="h-11" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-chart-4" />
                  {t("bodyTemperature")}
                </Label>
                <Input id="temperature" name="temperature" type="number" step="0.1" required placeholder="e.g. 36.6" value={formData.temperature} onChange={handleChange} className="h-11" />
              </div>

              <div className="space-y-3">
                <Label htmlFor="glucose" className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-chart-5" />
                  {t("bloodGlucose")}
                </Label>
                <Input id="glucose" name="glucose" type="number" required placeholder="e.g. 95" value={formData.glucose} onChange={handleChange} className="h-11" />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label htmlFor="notes">{t("additionalNotes")}</Label>
              <Textarea id="notes" name="notes" placeholder={t("howAreYouFeeling")} value={formData.notes} onChange={handleChange} className="min-h-[100px] resize-none" />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" className="mr-4" onClick={() => setLocation("/patient")}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createVital.isPending} className="px-8">
                {createVital.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                {t("saveRecord")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
