import { file } from "bun";

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

export const favico = new Response(file("images/favicon.ico"), {
  headers: {
    "Content-Type": "image/x-icon",
  },
});
