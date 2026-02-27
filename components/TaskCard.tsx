"use client";

import { useDraggable } from "@dnd-kit/core";
import { format } from "date-fns";
import { Calendar, GripVertical, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  agent: Agent | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  status: string;
}

const priorityConfig: Record<string, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  high: {
    label: "High",
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  low: {
    label: "Low",
    className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
};

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const priority = priorityConfig[task.priority] ?? priorityConfig.medium;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group relative gap-3 p-3 transition-shadow hover:shadow-md ${
        isDragging ? "z-50 opacity-75 shadow-lg" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <button
            {...listeners}
            {...attributes}
            className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </button>
          <h3 className="text-sm font-medium leading-tight truncate">
            {task.title}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="size-3.5" />
              <span className="sr-only">Task options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap items-center gap-2 pl-6">
        <Badge variant="outline" className={priority.className}>
          {priority.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="size-3" />
          {task.agent ? (
            <span>
              {task.agent.emoji} {task.agent.name}
            </span>
          ) : (
            <span className="italic">Unassigned</span>
          )}
        </span>
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
    </Card>
  );
}
