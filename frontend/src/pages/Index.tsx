import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Upload, MessageSquare, ShieldCheck, Monitor } from "lucide-react";
import { getSystemStatus } from "@/lib/api";

const TABS = [
  {
    path: "/qa",
    label: "RAG Q&A",
    icon: MessageSquare,
    title: "Knowledge Q&A",
    description: "Ask questions across your indexed procurement documents.",
  },
  {
    path: "/audit",
    label: "Procurement Audit",
    icon: ShieldCheck,
    title: "Procurement Audit",
    description: "Run the multi-agent risk, tax and control review on a purchase request.",
  },
  {
    path: "/upload",
    label: "Index Documents",
    icon: Upload,
    title: "Document Ingestion",
    description: "Populate the knowledge base with contracts, tariff schedules and policies.",
  },
  {
    path: "/status",
    label: "System Status",
    icon: Monitor,
    title: "System Status",
    description: "Live health of the backend, storage, vector index and models.",
  },
] as const;

type Health = "checking" | "online" | "offline";

const HEALTH_UI: Record<Health, { dot: string; label: string }> = {
  checking: { dot: "bg-warning animate-pulse", label: "Checking backend…" },
  online: { dot: "bg-success shadow-[0_0_8px_hsl(var(--success))]", label: "Backend online" },
  offline: { dot: "bg-danger", label: "Backend unreachable" },
};

const Index = () => {
  const { pathname } = useLocation();
  const [health, setHealth] = useState<Health>("checking");
  const current = TABS.find((t) => pathname === t.path || pathname.startsWith(t.path + "/")) ?? TABS[2];

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      getSystemStatus()
        .then(() => !cancelled && setHealth("online"))
        .catch(() => !cancelled && setHealth("offline"));
    check();
    const id = setInterval(check, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (becomes a top bar on small screens) */}
      <aside className="shrink-0 md:sticky md:top-0 md:h-screen md:w-[248px] border-b md:border-b-0 md:border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="px-5 pt-5 pb-4 md:pt-6 md:pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-base font-extrabold text-primary-foreground shrink-0 font-heading shadow-lg shadow-primary/25 ring-1 ring-white/10">
              M
            </div>
            <div>
              <h1 className="text-sm font-bold font-heading text-foreground tracking-tight leading-tight">
                Meridian AI
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight">Procurement Intelligence</p>
            </div>
          </div>
        </div>

        <div className="hidden md:block px-5 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Platform
          </span>
        </div>

        <nav className="flex md:flex-col gap-1 px-3 pb-3 md:pb-0 md:flex-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50
                  ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                    )}
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "" : "opacity-70 group-hover:opacity-100"}`} />
                    {tab.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="hidden md:block mx-3 mb-3 mt-2 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2">
            <span className={`h-2 w-2 rounded-full ${HEALTH_UI[health].dot}`} />
            <span className="text-xs text-muted-foreground">{HEALTH_UI[health].label}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50 text-center tracking-wide leading-relaxed">
            Aldermoor Industries · Hamburg
            <br />
            (fictional demo company)
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <header className="mb-6 md:mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/80">{current.label}</p>
            <h2 className="mt-1 text-2xl md:text-3xl font-bold font-heading tracking-tight text-foreground">
              {current.title}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{current.description}</p>
          </header>

          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Index;
