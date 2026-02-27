"use client";

import { formatDistanceToNow } from "date-fns";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AgentTask {
  id: string;
  title: string;
  status: string;
}

export interface AgentData {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
  lastActivityAt: string;
  currentTask: AgentTask | null;
}

interface AgentCardProps {
  agent: AgentData;
  onClick: (agent: AgentData) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  idle: {
    label: "Idle",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  offline: {
    label: "Offline",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

export function AgentCard({ agent, onClick }: AgentCardProps) {
  const status = statusConfig[agent.status] ?? statusConfig.offline;

  const lastActivity = formatDistanceToNow(new Date(agent.lastActivityAt), {
    addSuffix: true,
  });

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/30 hover:shadow-md",
        "py-4"
      )}
      onClick={() => onClick(agent)}
    >
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label={agent.name}>
              {agent.emoji}
            </span>
            <div>
              <p className="font-semibold leading-tight">{agent.name}</p>
              <p className="text-sm text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <Badge variant="outline" className={status.className}>
            {status.label}
          </Badge>
        </div>

        {agent.currentTask && (
          <div className="rounded-md bg-muted/50 px-3 py-2">
            <p className="text-xs text-muted-foreground">Current Task</p>
            <p className="text-sm font-medium truncate">
              {agent.currentTask.title}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          <span>{lastActivity}</span>
        </div>
      </CardContent>
    </Card>
  );
}
