"use client";

import Sidebar from "@/components/Sidebar";
import { User } from "lucide-react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-6">
          {/* Left: spacer on mobile for hamburger, title on desktop */}
          <div className="flex items-center gap-3">
            {/* Push content right on mobile so it doesn't overlap hamburger */}
            <div className="w-10 md:hidden" />
            <h1 className="text-base font-semibold tracking-tight">
              Mission Control
            </h1>
          </div>

          {/* Right: user info */}
          <div className="flex items-center gap-2.5">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Preston
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="size-4" />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
