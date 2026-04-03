import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { pairingCode, hardwareId } = body;

  if (!pairingCode || !hardwareId) {
    return NextResponse.json(
      { error: "pairingCode and hardwareId are required" },
      { status: 400 }
    );
  }

  const coordinator = await prisma.coordinator.findUnique({
    where: { pairingCode: pairingCode.toUpperCase() },
    include: { farm: true },
  });

  if (!coordinator) {
    return NextResponse.json(
      { error: "Invalid pairing code" },
      { status: 404 }
    );
  }

  if (coordinator.pairingExpiry && coordinator.pairingExpiry < new Date()) {
    return NextResponse.json(
      { error: "Pairing code expired" },
      { status: 410 }
    );
  }

  if (coordinator.hardwareId) {
    return NextResponse.json(
      { error: "Coordinator already paired" },
      { status: 409 }
    );
  }

  const apiKey = `qrop_${crypto.randomBytes(32).toString("hex")}`;

  const updated = await prisma.coordinator.update({
    where: { id: coordinator.id },
    data: {
      hardwareId,
      apiKey,
      pairingCode: null,
      pairingExpiry: null,
      status: "ONLINE",
      lastSeen: new Date(),
    },
    include: { farm: { select: { id: true, name: true, boundaries: true, timezone: true } } },
  });

  return NextResponse.json({
    coordinatorId: updated.id,
    apiKey,
    farm: updated.farm,
  });
}
