import { join } from "node:path";

import { handleNip05, parseAndValidateNip05Post } from "./nip05";
import { _302, _404, errorResponse, favico, okResponse } from "./response";
import type { NostrJson } from "./types";
import { commitAndPushChanges } from "./git";
import { Either } from "./utils";
import { getCorsHeaders, validateMessageSignature } from "./helpers";

const file = await Bun.file("db/nostr.json").text();
const json: NostrJson = JSON.parse(file);

const get = async (url: URL, headers: Headers) => {
  const nameRegisterCheck = url.pathname.match("^/v1/nostr-json/([a-z0-9]+)$");

  if (nameRegisterCheck && nameRegisterCheck.length === 2) {
    const name = nameRegisterCheck[1];

    const nameRecord = json["names"][name];

    if (!nameRecord) {
      return _404;
    }

    const message = headers.get("x-message");
    const pubkey = nameRecord.pubkey;
    const signature = headers.get("x-signature");

    if (!message || !signature) {
      return errorResponse("missing headers", 400);
    }

    const eitherSignature = validateMessageSignature({
      message,
      pubkey,
      signature,
    });

    if (Either.isLeft(eitherSignature)) {
      return Either.getLeft(eitherSignature);
    }

    const canUseUntil =
      nameRecord.canUseUntil && new Date(nameRecord.canUseUntil);

    return new Response(JSON.stringify({ name, canUseUntil }), {
      status: 200,
      headers: getCorsHeaders(),
    });
  }

  if (url.pathname === "/health") {
    return new Response(null, { status: 200, headers: getCorsHeaders() });
  }

  if (url.pathname === "/manifest.json") {
    return new Response(Bun.file("manifest.json"), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(),
      },
    });
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

  const pagesPath = url.pathname.match(/^\/pages\/.+\.(\w+)$/);

  if (pagesPath?.input) {
    const file = Bun.file(join(import.meta.dir, "../", pagesPath.input));
    const exists = await file.exists();

    if (exists) {
      return new Response(file, { headers: getCorsHeaders() });
    }
  }

  const imagesPath = url.pathname.match(/^\/images\/.+\.(\w+)$/);

  if (imagesPath?.input) {
    const file = Bun.file(join(import.meta.dir, "../", imagesPath.input));
    const exists = await file.exists();

    if (exists) {
      return new Response(file, {
        headers: {
          "Content-Type": `image/${imagesPath[1]}`,
          ...getCorsHeaders(),
        },
        status: 200,
      });
    }
  }

  return _404;
};

const post = async (url: URL, req: Request, body: any) => {
  if (url.pathname === "/v1/nostr-json/") {
    const either = parseAndValidateNip05Post({
      body,
      reqHeaders: req.headers,
      json,
    });

    if (Either.isLeft(either)) {
      return Either.getLeft(either);
    }

    const { name, pubkey, relays } = Either.getRight(either);

    // update memory object
    // you can't use it until someone pays for it, then canUseUntil will be updated
    json["names"][name] = { pubkey, canUseUntil: Date.now() };
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
  port: process.env.PORT || 3005,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET") {
      return get(url, req.headers);
    }

    if (req.method === "POST") {
      const body = await req.json();

      return post(url, req, body);
    }

    return _404;
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
