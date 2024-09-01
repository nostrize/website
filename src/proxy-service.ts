import { _404 } from "./response";

const post = async (req: Request) => {
  const url = new URL(req.url);

  if (url.pathname === "/v1/lightsats/create-tip") {
    const request = await req.json();

    const { amount, quantity, expiry, onboardingFlow, tippeeName } =
      request.payload;

    const response = await fetch("https://lightsats.com/api/tipper/tips", {
      method: "POST",
      body: JSON.stringify({
        amount,
        quantity,
        expiry,
        onboardingFlow,
        tippeeName,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${request.apiKey}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();

      console.error("Error from lightsats.com:", errorBody);

      return new Response(errorBody, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const responseBody = await response.text();

    return new Response(responseBody, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json",
      },
    });
  }

  return _404;
};

const port = 6006;

Bun.serve({
  port,
  async fetch(req) {
    try {
      console.log(`Received ${req.method} request to ${req.url}`); // Log all incoming requests

      if (req.method === "POST") {
        return post(req);
      }

      return new Response("Hello World");
    } catch (error) {
      console.error("Unhandled error in fetch handler:", error);

      return new Response(`Internal Server Error`, {
        status: 500,
      });
    }
  },
  error(error) {
    console.error("Server error:", error);

    return new Response(`Server Error: ${error.message}`, { status: 500 });
  },
});

console.log(`Proxy service running on port ${port}`);
