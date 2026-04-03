"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewFarmPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/farms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        location: formData.get("location") || null,
        timezone: formData.get("timezone") || "UTC",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create farm");
      setLoading(false);
      return;
    }

    const farm = await res.json();
    router.push(`/farms/${farm.id}`);
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Create a new farm
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Set up a farm to start deploying robots
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Farm name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="My Farm"
            />
          </div>
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Location
              <span className="ml-1 font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              placeholder="Provence, France"
            />
          </div>
          <div>
            <label
              htmlFor="timezone"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Timezone
            </label>
            <select
              id="timezone"
              name="timezone"
              defaultValue="Europe/Paris"
              className="mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Asia/Tokyo">Asia/Tokyo</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create farm"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
