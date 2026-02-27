"use client";

import {
  ListTodo,
  Loader2,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskData {
  id: string;
  status: string;
}

interface AgentData {
  id: string;
  status: string;
}

interface DashboardStatsProps {
  tasks: TaskData[];
  agents: AgentData[];
}

export function DashboardStats({ tasks, agents }: DashboardStatsProps) {
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const activeAgents = agents.filter((a) => a.status === "active").length;

  const stats = [
    {
      label: "Total Tasks",
      value: totalTasks,
      icon: ListTodo,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Loader2,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      iconColor: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Active Agents",
      value: activeAgents,
      icon: Users,
      iconColor: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-4">
          <CardContent className="flex items-center gap-4 px-4">
            <div className={`rounded-lg p-2.5 ${stat.bgColor}`}>
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
