"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskColumn } from "@/components/TaskColumn";
import { TaskCard, type Task, type Agent } from "@/components/TaskCard";
import { TaskDialog } from "@/components/TaskDialog";

const STATUSES = ["backlog", "in_progress", "review", "done"] as const;

interface TaskBoardProps {
  tasks: Task[];
  agents: Agent[];
  onTaskUpdated: () => void;
}

export function TaskBoard({ tasks, agents, onTaskUpdated }: TaskBoardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterAssignee !== "all" && task.assignedTo !== filterAssignee) {
        return false;
      }
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }
      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [tasks, filterAssignee, filterPriority, filterStatus]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    for (const status of STATUSES) {
      grouped[status] = filteredTasks.filter((t) => t.status === status);
    }
    return grouped;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) {
      setActiveTask(task);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Only proceed if the task is being dropped on a valid column
    if (!STATUSES.includes(newStatus as (typeof STATUSES)[number])) return;

    // Find the task being dragged
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  async function handleDelete(taskId: string) {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      onTaskUpdated();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  }

  function handleNewTask() {
    setEditingTask(undefined);
    setDialogOpen(true);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditingTask(undefined);
  }

  function handleSaved() {
    setDialogOpen(false);
    setEditingTask(undefined);
    onTaskUpdated();
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.emoji} {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleNewTask} size="sm">
          <Plus />
          New Task
        </Button>
      </div>

      {/* Kanban Columns */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid auto-cols-fr grid-flow-col gap-4 overflow-x-auto pb-2">
          {STATUSES.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-[280px]">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        task={editingTask}
        onSaved={handleSaved}
      />
    </div>
  );
}
