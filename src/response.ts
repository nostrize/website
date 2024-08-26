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
