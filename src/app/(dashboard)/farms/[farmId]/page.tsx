import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoordinatorSection } from "./coordinators/coordinator-section";

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const { farmId } = await params;

  const membership = await prisma.farmMember.findUnique({
    where: { userId_farmId: { userId: session.user.id, farmId } },
  });

  if (!membership) notFound();

  const farm = await prisma.farm.findUnique({
    where: { id: farmId },
    include: {
      coordinators: { orderBy: { createdAt: "desc" } },
      robots: { orderBy: { createdAt: "desc" } },
      _count: { select: { missions: true } },
    },
  });

  if (!farm) notFound();

  const canManage = membership.role === "OWNER" || membership.role === "MANAGER";

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/farms" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Farms
            </Link>
            <span>/</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {farm.name}
          </h1>
          {farm.location && (
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              {farm.location}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Coordinators", value: farm.coordinators.length },
          {
            label: "Online",
            value: farm.coordinators.filter((c) => c.status === "ONLINE").length,
          },
          { label: "Robots", value: farm.robots.length },
          { label: "Missions", value: farm._count.missions },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Coordinators */}
      <CoordinatorSection
        farmId={farm.id}
        coordinators={farm.coordinators.map((c) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          hardwareId: c.hardwareId,
          pairingCode: c.pairingCode,
          pairingExpiry: c.pairingExpiry?.toISOString() ?? null,
          lastSeen: c.lastSeen?.toISOString() ?? null,
          version: c.version,
        }))}
        canManage={canManage}
      />

      {/* Robots */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Robots
        </h2>
        {farm.robots.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            No robots registered yet. Robots appear automatically when they connect to a coordinator.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {farm.robots.map((robot) => (
              <div
                key={robot.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {robot.name || robot.id}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {robot.robotType.toLowerCase()} &middot; {robot.status.toLowerCase().replace("_", " ")}
                  </p>
                </div>
                {robot.batteryPct !== null && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {robot.batteryPct}% battery
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
