"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  LayoutDashboard,
  ListTodo,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
  lastActivityAt: string;
}

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Calendar", href: "/calendar", icon: Calendar },
];

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2 rounded-full shrink-0",
        status === "active" && "bg-emerald-500",
        status === "idle" && "bg-yellow-500",
        status === "offline" && "bg-zinc-500"
      )}
    />
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        }
      } catch {
        // Silently fail -- agents will remain empty
      }
    }
    fetchAgents();
  }, []);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* App title */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Rocket className="size-5 text-primary" />
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Mission Control
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Agent status list */}
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Agents
        </h3>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 pb-4">
          {agents.length === 0 ? (
            // Fallback placeholders while loading
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md px-3 py-2"
              >
                <span className="inline-block size-2 rounded-full bg-zinc-700 animate-pulse" />
                <span className="h-4 w-24 rounded bg-zinc-700 animate-pulse" />
              </div>
            ))
          ) : (
            agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent/30 transition-colors"
              >
                <StatusDot status={agent.status} />
                <span className="truncate">
                  {agent.emoji} {agent.name}
                </span>
                <span className="ml-auto text-[10px] capitalize text-muted-foreground">
                  {agent.status}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
      >
        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile (slide-in) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop (always visible) */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-border bg-sidebar text-sidebar-foreground h-screen sticky top-0">
        {sidebarContent}
      </aside>
    </>
  );
}
