import type { APIRoute } from 'astro';

const getTokensFromCode = async (code: string, redirect_uri: string) => {
  const query = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri,
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
    body: query,
  }).then((res) => res.json());

  return {
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_at: Date.now() + result.expires_in * 1000,
  };
};

export const post: APIRoute = async ({ request }) => {
  console.log(new URL(request.url))
  const { code } = await request.json();
  return {
    body: JSON.stringify(
      await getTokensFromCode(code, new URL(request.url).origin + '/galafy')
    ),
  };
};
