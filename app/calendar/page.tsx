"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import EventDialog, { type CalendarEvent } from "@/components/EventDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CalendarView = "month" | "week" | "day";

function getRange(view: CalendarView, anchorDate: Date) {
  if (view === "day") {
    return {
      start: startOfDay(anchorDate),
      end: endOfDay(anchorDate),
    };
  }

  if (view === "week") {
    return {
      start: startOfWeek(anchorDate, { weekStartsOn: 1 }),
      end: endOfWeek(anchorDate, { weekStartsOn: 1 }),
    };
  }

  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(anchorDate);

  return {
    start: startOfWeek(monthStart, { weekStartsOn: 1 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
  };
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const range = useMemo(() => getRange(view, currentDate), [view, currentDate]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString(),
      });
      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, [range.end, range.start]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const daysInGrid = useMemo(() => {
    const days: Date[] = [];
    let day = range.start;
    while (day <= range.end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [range.end, range.start]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(new Date(event.startTime), "yyyy-MM-dd");
      const dayEvents = map.get(key) ?? [];
      dayEvents.push(event);
      dayEvents.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      map.set(key, dayEvents);
    }
    return map;
  }, [events]);

  function handleOpenNew(date: Date) {
    setSelectedEvent(null);
    setSelectedDate(date);
    setDialogOpen(true);
  }

  function handleOpenEdit(event: CalendarEvent) {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startTime));
    setDialogOpen(true);
  }

  function movePrevious() {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, -1));
      return;
    }
    if (view === "week") {
      setCurrentDate((prev) => subWeeks(prev, 1));
      return;
    }
    setCurrentDate((prev) => subMonths(prev, 1));
  }

  function moveNext() {
    if (view === "day") {
      setCurrentDate((prev) => addDays(prev, 1));
      return;
    }
    if (view === "week") {
      setCurrentDate((prev) => addWeeks(prev, 1));
      return;
    }
    setCurrentDate((prev) => addMonths(prev, 1));
  }

  function headerLabel() {
    if (view === "day") {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    }
    if (view === "week") {
      return `${format(range.start, "MMM d")} - ${format(range.end, "MMM d, yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="size-6" />
            Calendar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan scheduled tasks, reminders, and recurring jobs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button size="sm" onClick={() => handleOpenNew(currentDate)}>
            <Plus className="size-4" />
            New Event
          </Button>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={movePrevious}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={moveNext}>
                <ChevronRight className="size-4" />
              </Button>
              <span className="ml-2 text-sm font-medium">{headerLabel()}</span>
            </div>

            <div className="flex items-center gap-1 rounded-md border p-1">
              {(["month", "week", "day"] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={view === option ? "default" : "ghost"}
                  className="capitalize"
                  onClick={() => setView(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                Loading events...
              </span>
            </div>
          ) : view === "month" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground px-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="text-center">
                    {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i), "EEE")}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {daysInGrid.map((day) => {
                  const dayKey = format(day, "yyyy-MM-dd");
                  const dayEvents = eventsByDay.get(dayKey) ?? [];
                  return (
                    <button
                      type="button"
                      key={dayKey}
                      onClick={() => handleOpenNew(day)}
                      className={cn(
                        "min-h-28 rounded-md border p-2 text-left align-top transition-colors hover:bg-accent/40",
                        !isSameMonth(day, currentDate) && "opacity-55",
                        isToday(day) && "border-primary"
                      )}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isToday(day) && "text-primary"
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge variant="secondary" className="text-[10px]">
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event) => (
                          <button
                            type="button"
                            key={event.id}
                            className="block w-full truncate rounded bg-primary/10 px-1.5 py-0.5 text-left text-[11px] hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(event);
                            }}
                          >
                            {format(new Date(event.startTime), "HH:mm")} {event.title}
                          </button>
                        ))}
                        {dayEvents.length > 3 ? (
                          <p className="text-[10px] text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : view === "week" ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
              {daysInGrid.map((day) => {
                const dayKey = format(day, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(dayKey) ?? [];
                return (
                  <div
                    key={dayKey}
                    className={cn(
                      "rounded-md border p-2",
                      isToday(day) && "border-primary"
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <button
                        type="button"
                        className={cn(
                          "text-sm font-medium hover:underline",
                          isToday(day) && "text-primary"
                        )}
                        onClick={() => handleOpenNew(day)}
                      >
                        {format(day, "EEE d")}
                      </button>
                      {dayEvents.length > 0 ? (
                        <Badge variant="outline">{dayEvents.length}</Badge>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      {dayEvents.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No events</p>
                      ) : (
                        dayEvents.map((event) => (
                          <button
                            type="button"
                            key={event.id}
                            className="block w-full rounded border bg-muted/40 px-2 py-1 text-left text-xs hover:bg-muted"
                            onClick={() => handleOpenEdit(event)}
                          >
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-muted-foreground">
                              {format(new Date(event.startTime), "HH:mm")} - {format(new Date(event.endTime), "HH:mm")}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="rounded-md border">
                {(eventsByDay.get(format(currentDate, "yyyy-MM-dd")) ?? []).length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No events on this day.
                  </div>
                ) : (
                  (eventsByDay.get(format(currentDate, "yyyy-MM-dd")) ?? []).map((event) => (
                    <button
                      type="button"
                      key={event.id}
                      className="flex w-full items-start gap-3 border-b px-4 py-3 text-left last:border-b-0 hover:bg-accent/40"
                      onClick={() => handleOpenEdit(event)}
                    >
                      <div className="w-20 shrink-0 text-xs text-muted-foreground pt-1">
                        <div>{format(new Date(event.startTime), "HH:mm")}</div>
                        <div>{format(new Date(event.endTime), "HH:mm")}</div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        {event.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {event.description}
                          </p>
                        ) : null}
                        <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                          {event.assignedAgent ? (
                            <span>
                              {event.assignedAgent.emoji} {event.assignedAgent.name}
                            </span>
                          ) : null}
                          {event.recurrence ? <span>Cron: {event.recurrence}</span> : null}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <EventDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSaved={fetchEvents}
        onDeleted={fetchEvents}
      />
    </div>
  );
}
