"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw } from "lucide-react";
import { AgentCard, type AgentData } from "@/components/AgentCard";
import { AgentDetailPanel } from "@/components/AgentDetailPanel";
import { DashboardStats } from "@/components/DashboardStats";
import MessageFeed from "@/components/MessageFeed";

interface TaskData {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignedTo: string | null;
}

export default function Home() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/tasks"),
      ]);

      if (agentsRes.ok) {
        const data = await agentsRes.json();
        setAgents(data);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setTasks(data);
      }

      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAgentClick = (agent: AgentData) => {
    setSelectedAgentId(agent.id);
    setDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
            <p className="mt-1 text-muted-foreground">Agent Status Dashboard</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <RefreshCw className="size-3" />
            <span>Updated {formatDistanceToNow(lastRefresh, { addSuffix: true })}</span>
          </div>
        </div>

        <div className="mb-8">
          <DashboardStats tasks={tasks} agents={agents} />
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Agents</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={handleAgentClick}
              />
            ))}
          </div>
        </div>

        <MessageFeed />
      </div>

      <AgentDetailPanel
        agentId={selectedAgentId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
