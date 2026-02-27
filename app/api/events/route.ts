import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const where: Record<string, unknown> = {};

    if (start || end) {
      const startTime: Record<string, Date> = {};
      if (start) {
        startTime.gte = new Date(start);
      }
      if (end) {
        startTime.lte = new Date(end);
      }
      where.startTime = startTime;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        assignedAgent: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description ?? "",
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        recurrence: body.recurrence ?? null,
        assignedAgentId: body.assignedAgentId ?? null,
      },
      include: {
        assignedAgent: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
