import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const take = searchParams.get("take");
    const skip = searchParams.get("skip");
    const fromAgentId = searchParams.get("fromAgentId");
    const toAgentId = searchParams.get("toAgentId");

    const where: Record<string, unknown> = {};

    if (fromAgentId) {
      where.fromAgentId = fromAgentId;
    }

    if (toAgentId) {
      where.toAgentId = toAgentId;
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        fromAgent: true,
        toAgent: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(take ? { take: parseInt(take, 10) } : {}),
      ...(skip ? { skip: parseInt(skip, 10) } : {}),
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const message = await prisma.message.create({
      data: {
        content: body.content,
        fromAgentId: body.fromAgentId ?? null,
        toAgentId: body.toAgentId ?? null,
        fromLabel: body.fromLabel ?? "system",
        toLabel: body.toLabel ?? "all",
      },
      include: {
        fromAgent: true,
        toAgent: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Failed to create message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
