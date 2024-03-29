import type { APIRoute } from "astro";

function generateRandomString(length: number) {
  let text = "";
  let possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const authorize = async (redirect_uri: string) => {
  const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
  const state = generateRandomString(16);
  // https://developer.spotify.com/documentation/web-api/concepts/scopes
  const scope =
    "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-playback-position user-top-read user-read-recently-played";

  const query = new URLSearchParams({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state,
  });

  return {
    url: "https://accounts.spotify.com/authorize?" + query,
    state,
  };
};

export const GET: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify(await authorize(new URL(request.url).origin + "/galafy"))
  );
};
