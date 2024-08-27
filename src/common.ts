import { errorResponse } from "./response";
import { Either } from "./utils";

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
