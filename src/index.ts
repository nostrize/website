import { handleNip05, validateNip05Post } from "./nip05";
import { _302, _404, favico, okResponse } from "./response";
import type { NostrJson } from "./types";
import { commitAndPushChanges } from "./git";
import { Either } from "./utils";

const file = await Bun.file("db/nostr.json").text();
const json: NostrJson = JSON.parse(file);

const get = (url: URL) => {
  if (url.pathname === "/health") {
    return new Response(null, { status: 200 });
  }

  // Handle the /.well-known/nostr.json?name=xxx path
  if (url.pathname === "/.well-known/nostr.json") {
    return handleNip05({ url, json });
  }

  if (url.pathname === "/") {
    // Temporarily redirect main page to Nostrize extension github
    return _302;
  }

  if (url.pathname === "/favicon.ico") {
    return favico;
  }

  return _404;
};

const post = async (url: URL, req: Request, body: any) => {
  if (url.pathname === "/v1/nostr-json/") {
    const either = validateNip05Post(body, req.headers, json);

    if (Either.isLeft(either)) {
      return Either.getLeft(either);
    }

    const { name, pubkey, relays } = Either.getRight(either);

    // update memory object
    json["names"][name] = pubkey;
    json["relays"][pubkey] = relays;

    // push change to git
    const either2 = await commitAndPushChanges(json, req.headers);

    if (Either.isLeft(either2)) {
      return Either.getLeft(either2);
    }

    return okResponse;
  }

  return _404;
};

const server = Bun.serve({
  port: 3005,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET") {
      return get(url);
    }

    if (req.method === "POST") {
      const body = await req.json();

      return post(url, req, body);
    }

    return _404;
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
