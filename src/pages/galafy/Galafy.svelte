<script>
  import SignIn from './SignIn.svelte';

  const getTokenFromRefresh = async () => {
    await fetch('/galafy/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: localStorage.getItem('spotify_refresh_token'),
      }),
    })
      .then((response) => response.json())
      .then((res) => {
        if (!res.access_token || !res.expires_at) {
          // Clear auth params from url
          localStorage.removeItem('spotify_access_token');
          localStorage.removeItem('spotify_refresh_token');
          localStorage.removeItem('spotify_expires_at');
        } else {
          // Set new tokens
          localStorage.setItem('spotify_access_token', res.access_token);
          localStorage.setItem('spotify_expires_at', res.expires_at);
        }
      });

    return localStorage.getItem('spotify_access_token') &&
      localStorage.getItem('spotify_refresh_token')
      ? true
      : false;
  };

  async function logProfile() {
    let access_token = localStorage.getItem('spotify_access_token');

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
    });

    const data = await response.json();
    console.log(data);

    // TODO: Make sure we get new tokens if a access_token doesnt work, and if we dont get new tokens, redirect to login page
    // TODO: DO THIS FOR ALL API CALLS
    if (data.error) {
      const isAuth = await getTokenFromRefresh();
      if (!isAuth) {
        window.location = '/galafy';
      }
    }
  }

  const checkAuth = async () => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get('code');
    const state = params.get('state');
    const spotify_state = localStorage.getItem('spotify_state');
    const spotify_access_token = localStorage.getItem('spotify_access_token');
    const spotify_refresh_token = localStorage.getItem('spotify_refresh_token');
    const spotify_expires_at = localStorage.getItem('spotify_expires_at');

    // Check for expired token
    if (spotify_expires_at < Date.now() && spotify_refresh_token) {
      return await getTokenFromRefresh();
    } else if (
      spotify_expires_at > Date.now() &&
      spotify_access_token &&
      spotify_refresh_token
    ) {
      // Test if token works with spotify api
      logProfile();
      return true;
    }

    // Check for code and state
    if (code && state && spotify_state && state === spotify_state) {
      await fetch(`/galafy/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
        }),
      })
        .then((response) => response.json())
        .then((res) => {
          if (!res.access_token || !res.refresh_token || !res.expires_at) {
            // Clear auth params from url
            params.delete('code');
            params.delete('state');
            localStorage.removeItem('spotify_state');
            window.location.search = params.toString();
          } else {
            // Set new tokens
            localStorage.setItem('spotify_access_token', res.access_token);
            localStorage.setItem('spotify_refresh_token', res.refresh_token);
            localStorage.setItem('spotify_expires_at', res.expires_at);
          }
        });

      return localStorage.getItem('spotify_access_token') &&
        localStorage.getItem('spotify_refresh_token')
        ? true
        : false;
    }

    return false;
  };
</script>

{#await checkAuth() then isAuth}
  {#if isAuth}
    <p>Hello world!</p>
  {:else}
    <SignIn />
  {/if}
{/await}
