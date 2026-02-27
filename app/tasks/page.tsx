"use client";

import { useCallback, useEffect, useState } from "react";
import { ListTodo, RefreshCw } from "lucide-react";
import { TaskBoard } from "@/components/TaskBoard";
import { Card, CardContent } from "@/components/ui/card";
import type { Agent, Task } from "@/components/TaskCard";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tasksRes, agentsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/agents"),
      ]);

      if (tasksRes.ok) {
        const taskData = await tasksRes.json();
        setTasks(taskData);
      }

      if (agentsRes.ok) {
        const agentData = await agentsRes.json();
        setAgents(agentData);
      }
    } catch (error) {
      console.error("Failed to fetch tasks page data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="size-6" />
            Task Board
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, update, and drag tasks through the workflow.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <RefreshCw className="size-4 animate-spin" />
              Loading tasks...
            </div>
          </CardContent>
        </Card>
      ) : (
        <TaskBoard tasks={tasks} agents={agents} onTaskUpdated={fetchData} />
      )}
    </div>
  );
}
