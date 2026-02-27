"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  recurrence: string | null;
  assignedAgentId: string | null;
  createdAt: string;
  assignedAgent?: {
    id: string;
    name: string;
    emoji: string;
  } | null;
}

interface Agent {
  id: string;
  name: string;
  emoji: string;
}

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEvent | null;
  selectedDate?: Date | null;
  onSaved: () => void;
  onDeleted: () => void;
}

function toLocalDatetimeString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventDialog({
  open,
  onClose,
  event,
  selectedDate,
  onSaved,
  onDeleted,
}: EventDialogProps) {
  const isEditing = !!event;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [assignedAgentId, setAssignedAgentId] = useState<string>("");
  const [recurrence, setRecurrence] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!open) return;

    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents");
        if (res.ok) {
          const data = await res.json();
          setAgents(data);
        }
      } catch {
        // Silently fail
      }
    }
    fetchAgents();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartTime(toLocalDatetimeString(new Date(event.startTime)));
      setEndTime(toLocalDatetimeString(new Date(event.endTime)));
      setAssignedAgentId(event.assignedAgentId ?? "none");
      setRecurrence(event.recurrence ?? "");
    } else {
      setTitle("");
      setDescription("");
      setRecurrence("");
      setAssignedAgentId("none");

      if (selectedDate) {
        const start = new Date(selectedDate);
        start.setHours(9, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(10, 0, 0, 0);
        setStartTime(toLocalDatetimeString(start));
        setEndTime(toLocalDatetimeString(end));
      } else {
        setStartTime("");
        setEndTime("");
      }
    }
  }, [open, event, selectedDate]);

  async function handleSave() {
    if (!title.trim() || !startTime || !endTime) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        assignedAgentId: assignedAgentId === "none" ? null : assignedAgentId,
        recurrence: recurrence.trim() || null,
      };

      if (isEditing && event) {
        const res = await fetch(`/api/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update event");
      } else {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create event");
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Failed to save event:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!event) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete event");

      onDeleted();
      onClose();
    } catch (error) {
      console.error("Failed to delete event:", error);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Event" : "New Event"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this event."
              : selectedDate
                ? `Create a new event on ${format(selectedDate, "MMMM d, yyyy")}.`
                : "Create a new event."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="event-description">Description</Label>
            <Textarea
              id="event-description"
              placeholder="Optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Start Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            {/* End Time */}
            <div className="grid gap-2">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="grid gap-2">
            <Label>Assigned Agent</Label>
            <Select
              value={assignedAgentId}
              onValueChange={setAssignedAgentId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.emoji} {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence */}
          <div className="grid gap-2">
            <Label htmlFor="event-recurrence">
              Recurrence{" "}
              <span className="text-muted-foreground font-normal">
                (cron expression, optional)
              </span>
            </Label>
            <Input
              id="event-recurrence"
              placeholder="e.g. 0 9 * * 1-5"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          {isEditing && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="mr-auto"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !title.trim() || !startTime || !endTime}
          >
            {saving ? "Saving..." : isEditing ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
