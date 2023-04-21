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
  // https://developer.spotify.com/documentation/web-api/concepts/scopes
  const scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-playback-position user-top-read user-read-recently-played';

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
