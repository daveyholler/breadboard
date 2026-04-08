import { createClient } from "@libsql/client";
import { nanoid } from "nanoid";
import type { Place, Breadboard, BreadboardSummary } from "@/types";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let migrated = false;

async function migrate() {
  if (migrated) return;
  await db.execute(`
    CREATE TABLE IF NOT EXISTS breadboards (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      places TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  migrated = true;
}

export async function listBreadboards(): Promise<BreadboardSummary[]> {
  await migrate();
  const result = await db.execute(
    "SELECT id, name, updated_at FROM breadboards ORDER BY updated_at DESC"
  );
  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    updated_at: row.updated_at as string,
  }));
}

export async function getBreadboard(
  id: string
): Promise<Breadboard | null> {
  await migrate();
  const result = await db.execute({
    sql: "SELECT id, name, places, created_at, updated_at FROM breadboards WHERE id = ?",
    args: [id],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id as string,
    name: row.name as string,
    places: JSON.parse(row.places as string) as Place[],
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}

export async function createBreadboard(
  name: string
): Promise<{ id: string; name: string }> {
  await migrate();
  const id = nanoid();
  await db.execute({
    sql: "INSERT INTO breadboards (id, name) VALUES (?, ?)",
    args: [id, name],
  });
  return { id, name };
}

export async function updateBreadboard(
  id: string,
  data: { places?: Place[]; name?: string }
): Promise<void> {
  await migrate();
  const sets: string[] = ["updated_at = datetime('now')"];
  const args: (string | null)[] = [];

  if (data.name !== undefined) {
    sets.push("name = ?");
    args.push(data.name);
  }
  if (data.places !== undefined) {
    sets.push("places = ?");
    args.push(JSON.stringify(data.places));
  }

  args.push(id);
  await db.execute({
    sql: `UPDATE breadboards SET ${sets.join(", ")} WHERE id = ?`,
    args,
  });
}
