import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generatePairingCode(): string {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 hex chars
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ farmId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { farmId } = await params;

  // Verify user is OWNER or MANAGER of this farm
  const membership = await prisma.farmMember.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId } },
  });

  if (!membership || membership.role === "VIEWER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name = (body as { name?: string }).name || null;

  const pairingCode = generatePairingCode();
  const pairingExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const coordinator = await prisma.coordinator.create({
    data: {
      farmId,
      name,
      pairingCode,
      pairingExpiry,
    },
  });

  return NextResponse.json(
    {
      id: coordinator.id,
      pairingCode: coordinator.pairingCode,
      pairingExpiry: coordinator.pairingExpiry,
      name: coordinator.name,
    },
    { status: 201 }
  );
}
