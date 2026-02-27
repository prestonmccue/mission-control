"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { MessageSquare, Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  fromAgentId: string | null;
  toAgentId: string | null;
  fromLabel: string;
  toLabel: string;
  content: string;
  createdAt: string;
}

interface MessageFeedProps {
  className?: string;
}

const POLL_INTERVAL = 5_000;
const TAKE = 50;

type ScopeFilter = "all" | "broadcast" | "direct";

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (isToday(date)) return format(date, "h:mm a");
  if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
  return format(date, "MMM d, h:mm a");
}

export default function MessageFeed({ className }: MessageFeedProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldAutoScroll = useRef(true);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?take=${TAKE}`);
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data.slice().reverse());
    } catch {
      // keep stale data when polling fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const id = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchMessages]);

  useEffect(() => {
    shouldAutoScroll.current = !isHovering;
  }, [isHovering]);

  useEffect(() => {
    if (shouldAutoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const agentNames = useMemo(() => {
    const names = new Set<string>();
    for (const msg of messages) {
      if (msg.fromLabel) names.add(msg.fromLabel);
      if (msg.toLabel && msg.toLabel !== "all") names.add(msg.toLabel);
    }
    return Array.from(names).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  }, [messages]);

  const filtered = useMemo(() => {
    let result = messages;

    if (agentFilter !== "all") {
      result = result.filter(
        (m) => m.fromLabel === agentFilter || m.toLabel === agentFilter
      );
    }

    if (scopeFilter === "broadcast") {
      result = result.filter((m) => m.toLabel === "all");
    } else if (scopeFilter === "direct") {
      result = result.filter((m) => m.toLabel !== "all");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.content.toLowerCase().includes(q) ||
          m.fromLabel.toLowerCase().includes(q) ||
          m.toLabel.toLowerCase().includes(q)
      );
    }

    return result;
  }, [messages, agentFilter, scopeFilter, search]);

  const filtersActive =
    agentFilter !== "all" || scopeFilter !== "all" || search.trim().length > 0;

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-lg border", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
        <h3 className="mr-auto text-sm font-semibold text-foreground">
          Communication Feed
        </h3>

        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger size="sm" className="w-[130px] text-xs">
            <Filter className="size-3 text-muted-foreground" />
            <SelectValue placeholder="All agents" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agents</SelectItem>
            {agentNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={scopeFilter}
          onValueChange={(value) => setScopeFilter(value as ScopeFilter)}
        >
          <SelectTrigger size="sm" className="w-[130px] text-xs">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="broadcast">Broadcast</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative w-[180px]">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-7 text-xs"
          />
        </div>

        {filtersActive ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={() => {
              setAgentFilter("all");
              setScopeFilter("all");
              setSearch("");
            }}
          >
            <X className="size-3.5" />
            Clear
          </Button>
        ) : null}
      </div>

      <ScrollArea
        className="max-h-[420px]"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col gap-px p-2">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-md px-2 py-1.5"
              >
                <span className="h-4 w-14 shrink-0 rounded bg-muted animate-pulse" />
                <span className="h-4 w-16 shrink-0 rounded bg-muted animate-pulse" />
                <span className="h-4 flex-1 rounded bg-muted animate-pulse" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <MessageSquare className="mb-2 size-8 opacity-40" />
              <p className="text-sm">
                {messages.length === 0
                  ? "No messages yet"
                  : "No messages match your filters"}
              </p>
            </div>
          ) : (
            filtered.map((msg) => {
              const isSystem = msg.fromLabel.toLowerCase() === "system";
              return (
                <div
                  key={msg.id}
                  className={cn(
                    "group flex items-baseline gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent/40",
                    isSystem && "italic text-muted-foreground"
                  )}
                >
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                    {formatTimestamp(msg.createdAt)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold",
                      isSystem ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {msg.fromLabel}
                  </span>
                  <span className="shrink-0 text-muted-foreground/50">
                    &rarr;
                  </span>
                  <Badge
                    variant={msg.toLabel === "all" ? "secondary" : "outline"}
                    className="shrink-0 px-1.5 py-0 text-[10px]"
                  >
                    {msg.toLabel}
                  </Badge>
                  <span
                    className={cn(
                      "min-w-0 break-words",
                      isSystem ? "text-muted-foreground" : "text-foreground/90"
                    )}
                  >
                    {msg.content}
                  </span>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
