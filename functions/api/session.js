const json = body => new Response(JSON.stringify(body), {
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  }
});

const publicResponse = () => json({ authenticated: true, public: true });
export const onRequestGet = publicResponse;
export const onRequestPost = publicResponse;
export const onRequestDelete = publicResponse;
