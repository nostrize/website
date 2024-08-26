import { getNip05Row } from "./db";
import { _404 } from "./response";
import type { HandleNip05Params } from "./types";

const empty = new Response(JSON.stringify({ names: {} }));

export function handleNip05(params: HandleNip05Params) {
  const { url, db } = params;

  let name = url.searchParams.get("name");

  if (!name) {
    return empty;
  }

  // Handle special case for _@nostrize.me
  if (name === "_") {
    name = "nostrize";
  }

  const row = getNip05Row(db, name);

  if (!row) {
    return _404;
  }

  const { pubkey, relays: relaysJson } = row;

  const relays = relaysJson ? JSON.parse(relaysJson) : null;

  return new Response(
    JSON.stringify({
      names: {
        [name]: pubkey,
      },
      relays,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
