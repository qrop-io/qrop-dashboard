"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CoordinatorData {
  id: string;
  name: string | null;
  status: string;
  hardwareId: string | null;
  pairingCode: string | null;
  pairingExpiry: string | null;
  lastSeen: string | null;
  version: string | null;
}

export function CoordinatorSection({
  farmId,
  coordinators,
  canManage,
}: {
  farmId: string;
  coordinators: CoordinatorData[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [showPairModal, setShowPairModal] = useState(false);
  const [pairingResult, setPairingResult] = useState<{
    pairingCode: string;
    pairingExpiry: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [coordinatorName, setCoordinatorName] = useState("");

  async function handleGenerateCode() {
    setLoading(true);
    const res = await fetch(`/api/farms/${farmId}/coordinators/pair`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: coordinatorName || null }),
    });

    if (res.ok) {
      const data = await res.json();
      setPairingResult({
        pairingCode: data.pairingCode,
        pairingExpiry: data.pairingExpiry,
      });
      router.refresh();
    }
    setLoading(false);
  }

  function statusColor(status: string) {
    switch (status) {
      case "ONLINE":
        return "bg-green-500";
      case "SYNCING":
        return "bg-blue-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-zinc-400";
    }
  }

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Coordinators
        </h2>
        {canManage && (
          <button
            onClick={() => {
              setShowPairModal(true);
              setPairingResult(null);
              setCoordinatorName("");
            }}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
          >
            Add coordinator
          </button>
        )}
      </div>

      {coordinators.length === 0 && !showPairModal ? (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          No coordinators yet. Add one to connect field robots.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {coordinators.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${statusColor(c.status)}`} />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">
                    {c.name || "Unnamed coordinator"}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {c.hardwareId ? (
                      <>
                        {c.hardwareId.slice(0, 12)}...
                        {c.lastSeen && (
                          <> &middot; Last seen {new Date(c.lastSeen).toLocaleString()}</>
                        )}
                      </>
                    ) : c.pairingCode ? (
                      <span className="font-mono text-amber-600 dark:text-amber-400">
                        Pairing code: {c.pairingCode}
                        {c.pairingExpiry && (
                          <> (expires {new Date(c.pairingExpiry).toLocaleTimeString()})</>
                        )}
                      </span>
                    ) : (
                      "Not paired"
                    )}
                  </p>
                </div>
              </div>
              <span className="text-xs text-zinc-400">
                {c.status.toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pairing Modal */}
      {showPairModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {pairingResult ? "Pairing code generated" : "Add coordinator"}
            </h3>

            {pairingResult ? (
              <div className="mt-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enter this code on your coordinator device:
                </p>
                <div className="mt-3 rounded-lg bg-zinc-100 p-4 text-center dark:bg-zinc-800">
                  <span className="font-mono text-3xl font-bold tracking-widest text-zinc-900 dark:text-zinc-100">
                    {pairingResult.pairingCode}
                  </span>
                </div>
                <p className="mt-2 text-center text-xs text-zinc-400">
                  Expires {new Date(pairingResult.pairingExpiry).toLocaleString()}
                </p>
                <button
                  onClick={() => setShowPairModal(false)}
                  className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="coordName"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    Name <span className="font-normal text-zinc-400">(optional)</span>
                  </label>
                  <input
                    id="coordName"
                    type="text"
                    value={coordinatorName}
                    onChange={(e) => setCoordinatorName(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    placeholder="Main barn coordinator"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleGenerateCode}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? "Generating..." : "Generate pairing code"}
                  </button>
                  <button
                    onClick={() => setShowPairModal(false)}
                    className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
