import { Database } from "bun:sqlite";

export type Nip05Row = {
  id: number;
  name: string;
  pubkey: string;
  relays?: string;
};

export type HandleNip05Params = { url: URL; db: Database };
