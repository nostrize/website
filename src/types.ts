export type Nip05Row = {
  name: string;
  pubkey: string;
  relays?: string[];
};

type Pubkey = string;

export type NostrJson = {
  names: { [name: string]: Pubkey };
  relays: { [pubkey: Pubkey]: string[] };
};

export type HandleNip05Params = { url: URL; json: NostrJson };
