import { schnorr } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha256";

import { Either } from "./utils";
import { errorResponse } from "./response";

type ValidateMessageSignatureParams = {
  message: string;
  pubkey: string;
  signature: string;
};

export function validateMessageSignature(
  params: ValidateMessageSignatureParams,
) {
  const { message, pubkey, signature } = params;

  const isValidSignature = schnorr.verify(signature, sha256(message), pubkey);

  if (!isValidSignature) {
    return Either.left(errorResponse("signature is not valid", 401));
  }

  return Either.right(null);
}

export function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}
