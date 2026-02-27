import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      data.title = body.title;
    }

    if (body.description !== undefined) {
      data.description = body.description;
    }

    if (body.startTime !== undefined) {
      data.startTime = new Date(body.startTime);
    }

    if (body.endTime !== undefined) {
      data.endTime = new Date(body.endTime);
    }

    if (body.recurrence !== undefined) {
      data.recurrence = body.recurrence || null;
    }

    if (body.assignedAgentId !== undefined) {
      data.assignedAgentId = body.assignedAgentId || null;
    }

    const event = await prisma.event.update({
      where: { id },
      data,
      include: {
        assignedAgent: true,
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to update event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
