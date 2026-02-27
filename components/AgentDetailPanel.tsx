"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Loader2,
  ListTodo,
  MessageSquare,
  Activity,
  Timer,
  Gauge,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AgentTask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface AgentMessage {
  id: string;
  content: string;
  fromLabel: string;
  toLabel: string;
  createdAt: string;
}

interface AgentDetail {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
  lastActivityAt: string;
  assignedTasks: AgentTask[];
  sentMessages: AgentMessage[];
}

interface AgentDetailPanelProps {
  agentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const taskStatusConfig: Record<string, { label: string; className: string }> = {
  backlog: {
    label: "Backlog",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  review: {
    label: "Review",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  done: {
    label: "Done",
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  high: {
    label: "High",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
};

function formatCycleTime(hours: number | null): string {
  if (hours === null) return "-";
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  return `${(hours / 24).toFixed(1)}d`;
}

export function AgentDetailPanel({
  agentId,
  open,
  onOpenChange,
}: AgentDetailPanelProps) {
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAgent = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAgent(data);
      }
    } catch (error) {
      console.error("Failed to fetch agent details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && agentId) {
      fetchAgent(agentId);
    }
    if (!open) {
      setAgent(null);
    }
  }, [open, agentId, fetchAgent]);

  const completedTasks =
    agent?.assignedTasks.filter((t) => t.status === "done") ?? [];
  const inProgressTasks =
    agent?.assignedTasks.filter((t) => t.status === "in_progress") ?? [];

  const status = agent
    ? (statusConfig[agent.status] ?? statusConfig.offline)
    : statusConfig.offline;

  const completionRate = useMemo(() => {
    if (!agent || agent.assignedTasks.length === 0) return 0;
    return Math.round((completedTasks.length / agent.assignedTasks.length) * 100);
  }, [agent, completedTasks.length]);

  const avgCompletionHours = useMemo(() => {
    if (completedTasks.length === 0) return null;

    const validDurations = completedTasks
      .map((task) => {
        const created = new Date(task.createdAt).getTime();
        const updated = new Date(task.updatedAt).getTime();
        const diff = updated - created;
        return diff > 0 ? diff / (1000 * 60 * 60) : null;
      })
      .filter((value): value is number => value !== null);

    if (validDurations.length === 0) return null;

    const total = validDurations.reduce((sum, value) => sum + value, 0);
    return total / validDurations.length;
  }, [completedTasks]);

  const messagesLast24h = useMemo(() => {
    if (!agent) return 0;
    const threshold = Date.now() - 24 * 60 * 60 * 1000;
    return agent.sentMessages.filter(
      (m) => new Date(m.createdAt).getTime() >= threshold
    ).length;
  }, [agent]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : agent ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl" role="img" aria-label={agent.name}>
                  {agent.emoji}
                </span>
                <div className="flex-1">
                  <DialogTitle className="flex items-center gap-2">
                    {agent.name}
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {agent.role} · Active {formatDistanceToNow(new Date(agent.lastActivityAt), { addSuffix: true })}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="size-3.5" />
                  <span className="text-xs">Completed</span>
                </div>
                <p className="text-2xl font-bold">{completedTasks.length}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Loader2 className="size-3.5" />
                  <span className="text-xs">In Progress</span>
                </div>
                <p className="text-2xl font-bold">{inProgressTasks.length}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Gauge className="size-3.5" />
                  <span className="text-xs">Completion Rate</span>
                </div>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Timer className="size-3.5" />
                  <span className="text-xs">Avg Cycle Time</span>
                </div>
                <p className="text-2xl font-bold">{formatCycleTime(avgCompletionHours)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <Activity className="size-3.5" />
                  <span className="text-xs">Total Tasks</span>
                </div>
                <p className="text-lg font-semibold">{agent.assignedTasks.length}</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="mb-1 flex items-center justify-center gap-1.5 text-muted-foreground">
                  <MessageSquare className="size-3.5" />
                  <span className="text-xs">Msgs (24h)</span>
                </div>
                <p className="text-lg font-semibold">{messagesLast24h}</p>
              </div>
            </div>

            <Separator />

            <ScrollArea className="flex-1 -mx-6 px-6 max-h-[40vh]">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ListTodo className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">Assigned Tasks</h3>
                  </div>
                  {agent.assignedTasks.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-6">
                      No tasks assigned
                    </p>
                  ) : (
                    <div className="space-y-2 pl-6">
                      {agent.assignedTasks.map((task) => {
                        const ts =
                          taskStatusConfig[task.status] ??
                          taskStatusConfig.backlog;
                        const pr =
                          priorityConfig[task.priority] ?? priorityConfig.medium;
                        return (
                          <div
                            key={task.id}
                            className="rounded-md border bg-muted/30 p-2.5"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium leading-tight">
                                {task.title}
                              </p>
                              <Badge
                                variant="outline"
                                className={ts.className}
                              >
                                {ts.label}
                              </Badge>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={pr.className}
                              >
                                {pr.label}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-semibold">
                      Messages Sent ({agent.sentMessages.length})
                    </h3>
                  </div>
                  {agent.sentMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground pl-6">
                      No messages
                    </p>
                  ) : (
                    <div className="space-y-2 pl-6">
                      {agent.sentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className="rounded-md border bg-muted/30 p-2.5"
                        >
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <span className="text-xs text-muted-foreground">
                              To: {msg.toLabel}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3" />
                              {formatDistanceToNow(new Date(msg.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Agent not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
