const getTokensFromCode = async (code) => {
  const query = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: import.meta.env.SPOTIFY_REDIRECT_URI,
  });

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        new Buffer.from(
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

export async function post({ request }) {
  const { code } = await request.json();
  return {
    body: JSON.stringify(await getTokensFromCode(code)),
  };
}
