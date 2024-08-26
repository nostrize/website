import { getDb } from "./db";

if (!process.env.NOSTRIZE_PUBKEY) {
  throw new Error("NOSTRIZE_PUBKEY is missing in the env");
}

if (!process.env.NOSTRIZE_RELAYS) {
  throw new Error("NOSTRIZE_RELAYS is missing in the env");
}

const db = getDb();

const createNip05Table = `CREATE TABLE IF NOT EXISTS nip05 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    pubkey TEXT NOT NULL,
    relays TEXT
);`;

db.run(createNip05Table);

db.run(`CREATE INDEX IF NOT EXISTS idx_name ON nip05("name")`);

db.run(`INSERT INTO nip05 VALUES ($name, $pubkey, $relays)`, [{ 
  $name: "nostrize",
  $pubkey: process.env.NOSTRIZE_PUBKEY,
  $relays: process.env.NOSTRIZE_RELAYS,
 }]);
