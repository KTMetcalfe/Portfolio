<script>
  import SignIn from "./SignIn.svelte";
  import { getTokensFromCode, getTokensFromRefresh } from "../helpers/spotify";
  import GalaxyScene from "./GalaxyScene.svelte";

  const checkAuth = async () => {
    const params = new URLSearchParams(window.location.search);

    const code = params.get("code");
    const state = params.get("state");
    const spotify_state = localStorage.getItem("spotify_state");
    const spotify_access_token = localStorage.getItem("spotify_access_token");
    const spotify_refresh_token = localStorage.getItem("spotify_refresh_token");
    const spotify_expires_at = localStorage.getItem("spotify_expires_at");

    // Check for expired token
    if (spotify_expires_at < Date.now() && spotify_refresh_token) {
      return await getTokensFromRefresh();
    } else if (
      spotify_expires_at > Date.now() &&
      spotify_access_token &&
      spotify_refresh_token
    ) {
      return true;
    }

    // Check for code and state
    if (code && state && spotify_state && state === spotify_state) {
      return await getTokensFromCode();
    }

    return false;
  };

  //
  // END OF AUTH
  //
</script>

{#await checkAuth() then isAuth}
  {#if isAuth}
    <GalaxyScene />
  {:else}
    <SignIn />
  {/if}
{/await}
