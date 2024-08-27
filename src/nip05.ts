import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

import { _402, _404, errorResponse } from "./response";
import type { HandleNip05Params, Nip05Row, NostrJson } from "./types";
import { Either, not } from "./utils";
import { validateApiKey } from "./common";

type GetNip05RowParams = {
  name: string;
  json: NostrJson;
};

function getNip05Row(params: GetNip05RowParams): Either<Response, Nip05Row> {
  const { name, json } = params;

  const nameRecord = json.names[name];

  if (!nameRecord) {
    return Either.left(_404);
  }

  const now = Date.now();
  const diff = (until: number) => until - now;

  const { pubkey, canUseUntil } = nameRecord;

  if (canUseUntil && diff(canUseUntil) > 0) {
    return Either.left(_402);
  }

  const relays = json.relays[pubkey];

  return Either.right({ name, pubkey, relays, canUseUntil });
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

  const rowEither = getNip05Row({ name, json });

  if (Either.isLeft(rowEither)) {
    return Either.getLeft(rowEither);
  }

  const row = Either.getRight(rowEither);

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

const jsonApiKeyValidate = validateApiKey("NOSTR_JSON_API_KEY");

type ParseAndValidateNip05PostParams = {
  body: any;
  reqHeaders: Headers;
  json: NostrJson;
};

export function parseAndValidateNip05Post(
  params: ParseAndValidateNip05PostParams,
): Either<Response, Nip05Row> {
  const { body, reqHeaders, json } = params;

  const either = jsonApiKeyValidate(reqHeaders);

  if (Either.isLeft(either)) {
    return either;
  }

  const { message, signature } = body;

  let messageParsed;

  try {
    messageParsed = JSON.parse(message);
  } catch (err) {
    return Either.left(
      errorResponse("message is corrupt, needs to be a stringified json", 400),
    );
  }

  const { name, pubkey, relays, canUseUntil } = messageParsed;

  if (not(name && pubkey && relays)) {
    return Either.left(errorResponse("message format is wrong", 400));
  }

  if (
    not(
      typeof name === "string" &&
        typeof pubkey === "string" &&
        Array.isArray(relays) &&
        relays.every((r) => typeof r === "string"),
    )
  ) {
    return Either.left(errorResponse("message format is wrong", 409));
  }

  if (canUseUntil && typeof canUseUntil !== "number") {
    return Either.left(errorResponse("message format is wrong", 409));
  }

  if (json.names[name]) {
    return Either.left(errorResponse("name already exists", 409));
  }

  const isValidSignature = schnorr.verify(signature, sha256(message), pubkey);

  if (!isValidSignature) {
    return Either.left(errorResponse("signature is not valid", 401));
  }

  return Either.right({ name, pubkey, relays, canUseUntil });
}
