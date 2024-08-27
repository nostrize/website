import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

import { handleNip05 } from "./nip05";
import {
  _302,
  _404,
  _409,
  errorResponse,
  favico,
  okResponse,
} from "./response";
import type { NostrJson } from "./types";
import { commitAndPushChanges } from "./git";

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

const post = async (url: URL, body: any) => {
  if (url.pathname === "/v1/nostr-json/") {
    const { name, pubkey, relays, signature } = body;

    if (json.names[name]) {
      return _409;
    }

    // Ensure the message order is exactly as it was when signed
    const message = JSON.stringify({ name, pubkey, relays });

    const isValidSignature = schnorr.verify(signature, sha256(message), pubkey);

    if (!isValidSignature) {
      return errorResponse("Message is not valid", 401);
    }

    json["names"][name] = pubkey;
    json["relays"][pubkey] = relays;

    await commitAndPushChanges(json);

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

      return post(url, body);
    }

    return _404;
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
