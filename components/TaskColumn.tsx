"use client";

import { useDroppable } from "@dnd-kit/core";
import { TaskCard, type Task } from "@/components/TaskCard";

const columnTitles: Record<string, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const columnAccentColors: Record<string, string> = {
  backlog: "bg-gray-500",
  in_progress: "bg-blue-500",
  review: "bg-amber-500",
  done: "bg-emerald-500",
};

interface TaskColumnProps {
  status: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskColumn({ status, tasks, onEdit, onDelete }: TaskColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: status,
  });

  const title = columnTitles[status] ?? status;
  const accentColor = columnAccentColors[status] ?? "bg-gray-500";

  return (
    <div className="flex min-w-[280px] flex-1 flex-col">
      <div className="mb-3 flex items-center gap-2">
        <div className={`size-2 rounded-full ${accentColor}`} />
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-2 rounded-lg border border-dashed p-2 transition-colors ${
          isOver
            ? "border-primary/50 bg-primary/5"
            : "border-transparent bg-muted/30"
        }`}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-xs text-muted-foreground">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
