function generateRandomString(length) {
  let text = '';
  let possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const authorize = async () => {
  const client_id = import.meta.env.SPOTIFY_CLIENT_ID;
  const redirect_uri = import.meta.env.SPOTIFY_REDIRECT_URI;
  const state = generateRandomString(16);
  const scope = 'user-top-read';

  const query = new URLSearchParams({
    response_type: 'code',
    client_id: client_id,
    scope: scope,
    redirect_uri: redirect_uri,
    state: state,
  });

  return {
    url: 'https://accounts.spotify.com/authorize?' + query,
    state: state,
  };
};

export async function get() {
  return {
    body: JSON.stringify(await authorize()),
  };
}
