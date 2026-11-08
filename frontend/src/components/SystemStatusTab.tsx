import React, { useState, useEffect, useCallback } from "react";
import {
  Server,
  Cloud,
  FolderOpen,
  Search,
  Bot,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { getSystemStatus, type SystemStatus } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type Tag = "ok" | "warn" | "error" | "info";

const TAG_STYLES: Record<Tag, string> = {
  ok: "bg-success/10 text-success ring-success/20",
  warn: "bg-warning/10 text-warning ring-warning/20",
  error: "bg-danger/10 text-danger ring-danger/20",
  info: "bg-accent/15 text-accent-foreground ring-accent/30",
};

function StatusRow({ label, value, mono, tag }: { label: string; value?: string | null; mono?: boolean; tag?: Tag }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-border/60 last:border-0 gap-4">
      <span className="text-xs text-muted-foreground shrink-0 pt-0.5">{label}</span>
      {tag ? (
        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ring-inset ${TAG_STYLES[tag]}`}>
          {value ?? "—"}
        </span>
      ) : (
        <span className={`text-sm text-card-foreground text-right break-all ${mono ? "font-mono text-xs" : ""}`}>
          {value ?? "—"}
        </span>
      )}
    </div>
  );
}

function StatusSection({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card/80 overflow-hidden shadow-sm transition-colors hover:border-primary/30">
      <div className="px-5 py-3.5 border-b border-border/60 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <span className="text-sm font-semibold font-heading text-card-foreground">{title}</span>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export default function SystemStatusTab() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getSystemStatus();
      setStatus(data);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
      setStatus(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 5000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground animate-fade-in">
        <span className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin mb-3" />
        <span className="text-sm">Loading system status…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 animate-fade-in flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </span>
        <div>
          <p className="text-sm text-danger font-semibold">Backend unreachable</p>
          <p className="text-sm text-muted-foreground mt-1 break-words">{error}</p>
          <button
            onClick={fetchStatus}
            className="mt-3 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const s = status!;
  const shortId = (id?: string) => (id ? id.split("/").pop() : "—");

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-gradient-to-r from-success/10 to-transparent px-5 py-3.5">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-sm font-semibold font-heading text-card-foreground">All systems operational</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {s.mode} mode
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">Auto-refresh 5s · Last: {lastUpdated}</span>
          <button
            onClick={fetchStatus}
            aria-label="Refresh status"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StatusSection title="Backend" icon={Server}>
          <StatusRow label="Mode (APP_MODE)" value={s.mode} tag={s.mode === "cloud" ? "info" : "ok"} />
          <StatusRow label="Status" value={s.backend?.status} tag="ok" />
          <StatusRow label="Uptime" value={s.backend?.uptime} mono />
          <StatusRow label="Python" value={s.backend?.python_version} mono />
          <StatusRow label="Platform" value={s.backend?.platform} />
        </StatusSection>

        <StatusSection title="Google Cloud Platform" icon={Cloud}>
          <StatusRow label="Project ID" value={s.gcp?.project_id} mono />
          <StatusRow label="Region" value={s.gcp?.region} mono />
        </StatusSection>

        <StatusSection title={s.mode === "cloud" ? "Cloud Storage (GCS)" : "Document Store (local)"} icon={FolderOpen}>
          <StatusRow label="Location" value={s.storage?.location} mono />
          <StatusRow label="Bucket" value={s.storage?.gcs_bucket} mono />
          <StatusRow label="Prefix" value={s.storage?.gcs_prefix} mono />
        </StatusSection>

        <StatusSection title={s.vector_search?.backend ?? "Vector Store"} icon={Search}>
          <StatusRow
            label={s.mode === "cloud" ? "Index ID" : "Path"}
            value={s.mode === "cloud" ? shortId(s.vector_search?.index_id) : s.vector_search?.index_id}
            mono
          />
          <StatusRow label="Endpoint ID" value={shortId(s.vector_search?.endpoint_id)} mono />
          <StatusRow
            label="Stream Update"
            value={s.vector_search?.stream_update ? "Enabled" : "Disabled"}
            tag={s.vector_search?.stream_update ? "ok" : "warn"}
          />
        </StatusSection>

        <StatusSection title="AI Models" icon={Bot}>
          <StatusRow label="Embedding" value={s.models?.embedding} mono />
          <StatusRow label="LLM" value={s.models?.llm} mono />
          <StatusRow label="Framework" value={s.models?.llm_framework} />
        </StatusSection>

        <StatusSection title="Session Stats" icon={BarChart3}>
          <StatusRow label="Uploads (session)" value={String(s.ingestion?.uploads_this_session ?? 0)} tag="info" />
        </StatusSection>
      </div>
    </div>
  );
}
