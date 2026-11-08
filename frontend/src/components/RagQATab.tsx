import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Search, Send, Sparkles, MessageSquare, Clock, Trash2, Bot } from "lucide-react";
import { askQuestion } from "@/lib/api";
import { getErrorMessage } from "@/lib/utils";

type RetrieverType = "similarity" | "contextual" | "multiquery";

const RETRIEVER_OPTIONS: { id: RetrieverType; label: string }[] = [
  { id: "similarity", label: "Normal" },
  { id: "contextual", label: "Contextual Compression" },
  { id: "multiquery", label: "Multi-Query" },
];

const EXAMPLE_QUERIES = [
  "What is Aldermoor Industries total revenue in FY2024?",
  "What are the standard payment terms for servo motor suppliers?",
  "What EU customs duty applies to PLC controllers imported from Japan?",
  "What is the IFRS depreciation schedule for filling line equipment?",
];

interface HistoryEntry {
  query: string;
  answer: string | null;
  error: string | null;
  ts: number;
}

function ThinkingIndicator() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-[min(30rem,100%)] rounded-2xl rounded-tl-sm border border-border/50 bg-muted/30 px-5 py-4"
    >
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-5 items-center gap-[3px]" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="eq-bar h-full w-[3px] rounded-full bg-gradient-to-t from-primary to-accent"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">Searching documents and writing an answer…</span>
        <span className="ml-auto text-xs tabular-nums text-muted-foreground/70">{seconds}s</span>
      </div>
      <div className="space-y-2" aria-hidden="true">
        <div className="skeleton-sweep h-2.5 w-[92%] rounded-full" />
        <div className="skeleton-sweep h-2.5 w-[78%] rounded-full [animation-delay:150ms]" />
        <div className="skeleton-sweep h-2.5 w-[56%] rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  );
}

export default function RagQATab() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [retrieverType, setRetrieverType] = useState<RetrieverType>("similarity");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [history]);

  const handleAsk = async (q?: string) => {
    const text = (q || query).trim();
    if (!text || loading) return;
    setQuery("");
    setLoading(true);
    const entry: HistoryEntry = { query: text, answer: null, error: null, ts: Date.now() };
    setHistory((prev) => [...prev, entry]);

    try {
      const res = await askQuestion(text, retrieverType);
      setHistory((prev) => prev.map((h) => (h.ts === entry.ts ? { ...h, answer: res.answer } : h)));
    } catch (err) {
      setHistory((prev) => prev.map((h) => (h.ts === entry.ts ? { ...h, error: getErrorMessage(err) } : h)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Row: Query Input & Example Queries */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Knowledge Query - 75% width */}
        <div className="lg:col-span-3 rounded-xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-1">
            <Search className="w-[18px] h-[18px] text-primary" />
            <h2 className="text-base font-semibold font-heading text-card-foreground">Knowledge Query</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Ask questions against ingested Aldermoor procurement documents — supplier contracts, EU tariff schedules, IFRS annual reports, and compliance policies.
          </p>

          <div className="mb-5 space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Retrieval Strategy</label>
            <div className="flex bg-muted/30 p-1 rounded-lg border border-border">
              {RETRIEVER_OPTIONS.map(type => (
                <button
                  key={type.id}
                  onClick={() => setRetrieverType(type.id)}
                  className={`flex-1 text-xs font-medium py-2 rounded-md transition-all ${retrieverType === type.id ? 'bg-background shadow-sm text-foreground font-semibold border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Question</label>
          <textarea
            className="w-full mt-2 p-3 rounded-md border border-border bg-background text-card-foreground text-sm font-body resize-vertical focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors min-h-[110px] placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAsk(); } }}
            placeholder="e.g. What is the EU import duty rate for servo motors from Japan?"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">Enter to send · Shift+Enter for newline</span>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold transition-colors hover:bg-primary/90 disabled:opacity-50"
              disabled={!query.trim() || loading}
              onClick={() => handleAsk()}
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Thinking…</>
              ) : (
                <><Send className="w-4 h-4" /> Ask</>
              )}
            </button>
          </div>
        </div>

        {/* Example queries - Remaining space, vertical order */}
        <div className="lg:col-span-1 rounded-xl border border-border bg-card/80 p-6 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <Sparkles className="w-[18px] h-[18px] text-accent" />
            <h2 className="text-base font-semibold font-heading text-card-foreground">Query Assistant</h2>
          </div>
          <div className="flex flex-col gap-2">
            {EXAMPLE_QUERIES.map((eq) => (
              <button
                key={eq}
                className="flex items-center gap-2 text-left p-2.5 rounded-md border border-border text-[13px] text-muted-foreground hover:bg-muted hover:text-card-foreground transition-all group"
                onClick={() => { setQuery(eq); handleAsk(eq); }}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span className="line-clamp-3">{eq}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Answer History */}
      <div className="w-full">
        <div className="rounded-xl border border-border bg-card/80 p-6 flex flex-col shadow-sm" style={{ minHeight: 300 }}>
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div className="flex items-center gap-2.5">
              <Clock className="w-[18px] h-[18px] text-muted-foreground" />
              <h2 className="text-base font-semibold font-heading text-card-foreground">Answers</h2>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{history.length} {history.length === 1 ? "query" : "queries"} in this session</span>
            </div>
            {history.length > 0 && (
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => setHistory([])}
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[640px] pr-2 custom-scrollbar">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
                <Search className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm font-medium">No queries yet</p>
                <p className="text-xs opacity-60">Your question history will appear here</p>
              </div>
            ) : (
              <div className="space-y-8">
                {history.map((h) => (
                  <div key={h.ts} className="space-y-4 animate-fade-in">
                    {/* Question: right side */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl rounded-br-sm bg-primary/15 border border-primary/25 px-4 py-2.5">
                        <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-wrap break-words">{h.query}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 pr-1">{new Date(h.ts).toLocaleTimeString()}</span>
                    </div>

                    {/* Answer: left side */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 max-w-[95%] sm:max-w-[85%]">
                        {h.answer ? (
                          <div className="rounded-2xl rounded-tl-sm bg-muted/40 border border-border/60 px-5 py-4 shadow-sm">
                            <div className="prose prose-sm prose-invert max-w-none break-words
                              prose-headings:font-heading prose-headings:text-card-foreground prose-headings:mt-4 prose-headings:mb-2 first:prose-headings:mt-0
                              prose-p:my-2 prose-p:leading-relaxed prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2
                              prose-strong:text-card-foreground prose-hr:my-4 prose-hr:border-border
                              prose-a:text-primary prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
                              prose-th:text-card-foreground prose-table:text-xs">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.answer}</ReactMarkdown>
                            </div>
                          </div>
                        ) : h.error ? (
                          <div className="rounded-2xl rounded-tl-sm p-4 bg-destructive/5 border border-destructive/20">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1">Error</p>
                            <p className="text-sm text-destructive break-words">{h.error}</p>
                          </div>
                        ) : (
                          <ThinkingIndicator />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
