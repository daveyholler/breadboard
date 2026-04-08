import Link from "next/link";
import { listBreadboards } from "@/lib/db";
import { NewBreadboardButton } from "@/components/NewBreadboardButton";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const breadboards = await listBreadboards();

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-funnel-display)" }}
        >
          Breadboards
        </h1>
        <NewBreadboardButton />
      </div>

      {breadboards.length === 0 ? (
        <div className="text-center py-16">
          <p
            className="text-lg text-muted-foreground mb-2"
            style={{ fontFamily: "var(--font-funnel-sans)" }}
          >
            No breadboards yet
          </p>
          <p className="text-sm text-muted-foreground">
            Create your first breadboard to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {breadboards.map((b) => (
            <Link
              key={b.id}
              href={`/b/${b.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-medium"
                  style={{ fontFamily: "var(--font-funnel-display)" }}
                >
                  {b.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(b.updated_at + "Z").toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
