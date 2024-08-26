import { Database } from "bun:sqlite";

export function migrationScript(db: Database) {
  if (!process.env.NOSTRIZE_PUBKEY) {
    throw new Error("NOSTRIZE_PUBKEY is missing in the env");
  }

  if (!process.env.NOSTRIZE_RELAYS) {
    throw new Error("NOSTRIZE_RELAYS is missing in the env");
  }

  const createNip05Table = `CREATE TABLE IF NOT EXISTS nip05 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    pubkey TEXT NOT NULL,
    relays TEXT
);`;

  db.run(createNip05Table);

  db.run(`CREATE INDEX IF NOT EXISTS idx_name ON nip05("name")`);

  const relays = JSON.parse(process.env.NOSTRIZE_RELAYS || "[]");

  const result = db
    .query<
      { count: number },
      string
    >("SELECT COUNT(*) as count FROM nip05 WHERE name = ?")
    .get("nostrize");

  if (result!.count === 0) {
    const changes = db.run(
      `INSERT INTO nip05 (name, pubkey, relays) VALUES (?, ?, ?)`,
      ["nostrize", process.env.NOSTRIZE_PUBKEY, JSON.stringify(relays)],
    );

    console.log("changes", changes);
  }
}
