import { _404 } from "./response";
import type { HandleNip05Params, Nip05Row, NostrJson } from "./types";

type GetNip05RowParams = {
  name: string;
  json: NostrJson;
};

function getNip05Row(params: GetNip05RowParams): Nip05Row | null {
  const { name, json } = params;

  const pubkey = json.names[name];

  if (!pubkey) {
    return null;
  }

  const relays = json.relays[pubkey];

  return { name, pubkey, relays };
}

export function handleNip05(params: HandleNip05Params) {
  const { url, json } = params;

  let name = url.searchParams.get("name");

  if (!name) {
    return _404;
  }

  // Handle special case for _@nostrize.me
  if (name === "_") {
    name = "nostrize";
  }

  const row = getNip05Row({ name, json });

  if (!row) {
    return _404;
  }

  return new Response(
    JSON.stringify({
      names: {
        [name]: row.pubkey,
      },
      relays: row.relays,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
