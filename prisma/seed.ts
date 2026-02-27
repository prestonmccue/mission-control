import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create agents
  const agents = await Promise.all([
    prisma.agent.upsert({
      where: { name: "Zora" },
      update: {},
      create: {
        name: "Zora",
        role: "Chief of Staff",
        emoji: "👑",
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
    prisma.agent.upsert({
      where: { name: "Grabber" },
      update: {},
      create: {
        name: "Grabber",
        role: "Lead Acquisition",
        emoji: "🎯",
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
    prisma.agent.upsert({
      where: { name: "Loki" },
      update: {},
      create: {
        name: "Loki",
        role: "Graphic Design",
        emoji: "🎨",
        status: "idle",
        lastActivityAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    }),
    prisma.agent.upsert({
      where: { name: "Cody" },
      update: {},
      create: {
        name: "Cody",
        role: "Development",
        emoji: "💻",
        status: "active",
        lastActivityAt: new Date(),
      },
    }),
    prisma.agent.upsert({
      where: { name: "Zoe" },
      update: {},
      create: {
        name: "Zoe",
        role: "Customer Experience",
        emoji: "💬",
        status: "idle",
        lastActivityAt: new Date(Date.now() - 1000 * 60 * 15),
      },
    }),
  ]);

  const [zora, grabber, loki, cody, zoe] = agents;

  // Create tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Build Mission Control Dashboard",
        description: "Create the main dashboard for monitoring all agents",
        status: "in_progress",
        priority: "high",
        assignedTo: cody.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Design brand guidelines",
        description: "Create comprehensive brand guidelines document",
        status: "review",
        priority: "medium",
        assignedTo: loki.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Outreach campaign Q1",
        description: "Plan and execute Q1 lead acquisition campaign",
        status: "in_progress",
        priority: "high",
        assignedTo: grabber.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Customer feedback analysis",
        description: "Analyze recent customer feedback and create report",
        status: "backlog",
        priority: "medium",
        assignedTo: zoe.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Weekly team sync agenda",
        description: "Prepare agenda for the weekly team sync meeting",
        status: "done",
        priority: "low",
        assignedTo: zora.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "API integration testing",
        description: "Test all API endpoints for the new integration",
        status: "backlog",
        priority: "urgent",
        assignedTo: cody.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Social media graphics",
        description: "Create graphics for social media posts this week",
        status: "backlog",
        priority: "medium",
        assignedTo: loki.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Lead qualification criteria",
        description: "Define and document lead qualification criteria",
        status: "in_progress",
        priority: "high",
        assignedTo: grabber.id,
      },
    }),
  ]);

  // Update agents with current tasks
  await prisma.agent.update({
    where: { id: cody.id },
    data: { currentTaskId: tasks[0].id },
  });
  await prisma.agent.update({
    where: { id: grabber.id },
    data: { currentTaskId: tasks[2].id },
  });

  // Create messages
  await Promise.all([
    prisma.message.create({
      data: {
        fromAgentId: zora.id,
        fromLabel: "Zora",
        toLabel: "all",
        content: "Good morning team! Let's have a productive day.",
      },
    }),
    prisma.message.create({
      data: {
        fromAgentId: cody.id,
        fromLabel: "Cody",
        toAgentId: zora.id,
        toLabel: "Zora",
        content: "Starting work on Mission Control dashboard. Will update when MVP is ready.",
      },
    }),
    prisma.message.create({
      data: {
        fromAgentId: grabber.id,
        fromLabel: "Grabber",
        toAgentId: zora.id,
        toLabel: "Zora",
        content: "Q1 campaign draft is ready for review. 47 new leads identified.",
      },
    }),
    prisma.message.create({
      data: {
        fromAgentId: loki.id,
        fromLabel: "Loki",
        toLabel: "all",
        content: "Brand guidelines v2 is in review. Check the shared folder.",
      },
    }),
    prisma.message.create({
      data: {
        fromAgentId: zoe.id,
        fromLabel: "Zoe",
        toAgentId: zora.id,
        toLabel: "Zora",
        content: "Customer satisfaction score is up 12% this month!",
      },
    }),
    prisma.message.create({
      data: {
        fromLabel: "system",
        toLabel: "all",
        content: "Daily standup reminder: 9:00 AM",
      },
    }),
    prisma.message.create({
      data: {
        fromAgentId: zora.id,
        fromLabel: "Zora",
        toAgentId: cody.id,
        toLabel: "Cody",
        content: "Priority update: API integration testing moved to urgent. Please plan accordingly.",
      },
    }),
  ]);

  // Create events
  const now = new Date();
  await Promise.all([
    prisma.event.create({
      data: {
        title: "Daily Standup",
        description: "Team sync meeting",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 15),
        recurrence: "0 9 * * 1-5",
        assignedAgentId: zora.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Sprint Review",
        description: "End of sprint review and demo",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 14, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 15, 0),
      },
    }),
    prisma.event.create({
      data: {
        title: "Q1 Campaign Launch",
        description: "Launch the Q1 outreach campaign",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 10, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 11, 0),
        assignedAgentId: grabber.id,
      },
    }),
    prisma.event.create({
      data: {
        title: "Design Review",
        description: "Review brand guidelines with the team",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 13, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0),
        assignedAgentId: loki.id,
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
