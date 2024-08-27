import { randomBytes } from "@noble/hashes/utils";

const generateApiKey = (length = 32): string => {
  // Generate a random byte array
  const randomBytesArray = randomBytes(length);

  // Convert the byte array to a hexadecimal string
  return Buffer.from(randomBytesArray).toString("hex"); // Or use 'base64'
};

const apiKey = generateApiKey();

console.log("Generated API Key:", apiKey);
