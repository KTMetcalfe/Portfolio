import type { APIRoute } from 'astro';

const getTokensFromRefresh = async (refresh_token: string) => {
  const data = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token,
  });

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          import.meta.env.SPOTIFY_CLIENT_ID +
            ':' +
            import.meta.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  }).then((res) => res.json());

  return {
    access_token: result.access_token,
    expires_at: Date.now() + result.expires_in * 1000,
  };
};

export const post: APIRoute = async ({ request }) => {
  const { refresh_token } = await request.json();
  return {
    body: JSON.stringify(await getTokensFromRefresh(refresh_token)),
  };
};
