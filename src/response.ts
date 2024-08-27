import { file } from "bun";

export const _402 = new Response("Payment Required", { status: 402 });

export const _404 = new Response("Not Found", {
  status: 404,
  headers: {
    "Content-Type": "text/plain",
  },
});

export const _302 = new Response(null, {
  status: 302,
  headers: {
    Location: "https://github.com/nostrize/extension",
  },
});

export const errorResponse = (message: string, status: number) =>
  new Response(message, { status });

export const okResponse = new Response(null, { status: 200 });

export const favico = new Response(file("images/favicon.ico"), {
  headers: {
    "Content-Type": "image/x-icon",
  },
});
