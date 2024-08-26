import { getDb } from "./db";
import { handleNip05 } from "./nip05";
import { _302, _404 } from "./response";

const db = getDb();

const server = Bun.serve({
  port: 3005,
  fetch(req) {
    const url = new URL(req.url);

    // Handle the /.well-known/nostr.json?name=xxx path
    if (url.pathname === "/.well-known/nostr.json") {
      return handleNip05({ url, db });
    }

    if (url.pathname === "/") {
      // Temporarily redirect main page to Nostrize extension github
      return _302;
    }

    return _404;
  },
});

console.log(`Listening on ${server.hostname}:${server.port}`);
