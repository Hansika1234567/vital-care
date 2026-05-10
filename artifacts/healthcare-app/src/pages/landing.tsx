import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, HeartPulse, Stethoscope, ChevronRight, AlertTriangle, Building2, Loader2, User, Stethoscope as DoctorIcon, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { login } = useAuth();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const tryDemo = async (role: string) => {
    setLoadingRole(role);
    try {
      await login({ email: `${role}@demo.com`, password: "demo123" });
    } catch {
      setLoadingRole(null);
    }
  };

  const demoRoles = [
    { key: "patient", label: "Patient View", icon: User, color: "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white hover:border-blue-500" },
    { key: "doctor", label: "Doctor View", icon: Stethoscope, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500" },
    { key: "admin", label: "Admin View", icon: LayoutDashboard, color: "bg-violet-500/10 text-violet-600 border-violet-200 hover:bg-violet-500 hover:text-white hover:border-violet-500" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">VitalCare</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-background pt-24 pb-32">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
                Clinical precision meets <span className="text-primary">modern care.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                A premium health monitoring platform for patients, doctors, and hospitals. Real-time vitals, AI-assisted insights, and instant alerts.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 shadow-xl shadow-primary/20">
                    Get Started <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8">
                    Try Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 bg-muted/20 border-y">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-10"
            >
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Live Demo</span>
              <h2 className="text-3xl font-bold tracking-tight mb-3">See VitalCare in action</h2>
              <p className="text-muted-foreground text-lg">Jump straight into a live dashboard — no sign-up needed.</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              {demoRoles.map(({ key, label, icon: Icon, color }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="w-full sm:w-auto"
                >
                  <button
                    onClick={() => tryDemo(key)}
                    disabled={loadingRole !== null}
                    className={`w-full sm:w-44 flex items-center justify-center gap-2.5 h-14 px-6 rounded-xl border-2 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${color}`}
                  >
                    {loadingRole === key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Icon className="h-4 w-4 shrink-0" />
                    )}
                    {label}
                  </button>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Pre-filled with sample vitals, appointments, alerts, and AI insights
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-b bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Active Patients", value: "10,000+" },
                { label: "Doctors", value: "500+" },
                { label: "Hospitals", value: "50+" },
                { label: "Vitals Monitored", value: "1M+" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center space-y-2"
                >
                  <div className="text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Enterprise-grade health monitoring</h2>
              <p className="text-muted-foreground text-lg">Designed for scale, built for care. Everything you need to monitor health proactively.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Real-time Vitals",
                  description: "Monitor heart rate, blood pressure, SpO2, and more with clinical accuracy.",
                  icon: HeartPulse,
                },
                {
                  title: "Smart Alerts",
                  description: "Automated early warning system detects anomalies before they become critical.",
                  icon: AlertTriangle,
                },
                {
                  title: "Secure Data",
                  description: "HIPAA-compliant infrastructure ensures patient data is always protected.",
                  icon: ShieldCheck,
                },
                {
                  title: "Doctor Portal",
                  description: "Dedicated workspace for physicians to manage patient lists and appointments.",
                  icon: Stethoscope,
                },
                {
                  title: "AI Assistant",
                  description: "Intelligent health insights powered by advanced medical language models.",
                  icon: Activity,
                },
                {
                  title: "Hospital Admin",
                  description: "Comprehensive tools for hospital administrators to oversee operations.",
                  icon: Building2,
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity className="h-5 w-5" />
            <span className="font-semibold text-foreground">VitalCare</span>
          </div>
          <p>© 2025 VitalCare Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
