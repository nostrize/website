import { errorResponse } from "./response";
import { Either } from "./utils";

// TODO: actual verification needs to be like this:
// secret won't be sent
// secret is shared and kept in both sides
// signature of secret and body will be sent in the headers
/*

payload_hmac = hmac.HMAC(
    bytes(secret, "UTF-8"), body, digestmod=hashlib.sha256
)
base64_encoded_payload_hmac = base64.b64encode(
    payload_hmac.digest()
)

return base64_encoded_payload_hmac.decode() == sig

*/

export const validateApiKey = (apiKeyName: string) => (reqHeaders: Headers) => {
  const apiKey = process.env[apiKeyName];

  if (!apiKey) {
    console.error(`${apiKeyName} in environment variables is missing`);

    return Either.left(errorResponse("Service error", 501));
  }

  const apiKeyInHeaders = reqHeaders.get("x-api-key");

  if (apiKeyInHeaders !== apiKey) {
    return Either.left(errorResponse("Unauthorized", 401));
  }

  return Either.right(null);
};
