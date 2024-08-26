import * as path from "node:path";
import { Database } from "bun:sqlite";
import type { Nip05Row } from "./types";

export function getDb(): Database {
  const dbName = process.env.DB_NAME;

  if (!dbName) {
    throw new Error("DB_NAME is not defined");
  }

  const db = new Database(path.join("db", dbName), {
    create: true,
    strict: true,
  });

  db.exec("PRAGMA journal_mode = WAL;");

  return db;
}

export function getNip05Row(db: Database, name: string) {
  return db
    .query<Nip05Row, string>("SELECT pubkey, relays FROM nip05 WHERE name = ?")
    .get(name);
}
