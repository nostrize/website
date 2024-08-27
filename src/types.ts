export type Nip05Row = {
  name: string;
  pubkey: string;
  relays: string[];
  canUseUntil?: number;
};

type Pubkey = string;

type NameRecord = {
  pubkey: Pubkey;
  canUseUntil?: number;
};

export type NostrJson = {
  names: {
    [name: string]: NameRecord;
  };
  relays: { [pubkey: Pubkey]: string[] };
};

export type HandleNip05Params = { url: URL; json: NostrJson };
