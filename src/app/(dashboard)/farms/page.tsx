import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FarmsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const memberships = await prisma.farmMember.findMany({
    where: { userId: session.user.id },
    include: {
      farm: {
        include: {
          _count: { select: { coordinators: true, robots: true, missions: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Your farms
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your autonomous farming operations
          </p>
        </div>
        <Link
          href="/farms/new"
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
        >
          New farm
        </Link>
      </div>

      {memberships.length === 0 ? (
        <div className="mt-12 rounded-xl border-2 border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <svg
              className="h-7 w-7 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            No farms yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create your first farm to start managing robots
          </p>
          <Link
            href="/farms/new"
            className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Create farm
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {memberships.map(({ farm, role }) => (
            <Link
              key={farm.id}
              href={`/farms/${farm.id}`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-green-800"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-zinc-900 group-hover:text-green-700 dark:text-zinc-100 dark:group-hover:text-green-400">
                    {farm.name}
                  </h3>
                  {farm.location && (
                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {farm.location}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {role.toLowerCase()}
                </span>
              </div>
              <div className="mt-4 flex gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>{farm._count.coordinators} coordinators</span>
                <span>{farm._count.robots} robots</span>
                <span>{farm._count.missions} missions</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
