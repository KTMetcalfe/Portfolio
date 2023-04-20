<script lang="ts">
  import { type TopArtists, type TopTracks, getTokensFromRefresh } from '../../components/helpers/spotify';

  const getTopOfType = async (top_type: 'artists' | 'tracks') => {
    const response: TopArtists | TopTracks = await fetch(
      `https://api.spotify.com/v1/me/top/${top_type}?limit=50`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        // TODO: Make sure we get new tokens if a access_token doesnt work, and if we dont get new tokens, redirect to login page
        // TODO: DO THIS FOR ALL API CALLS
        if (data.error) {
          const isAuth = await getTokensFromRefresh();
          if (!isAuth) {
            window.location.href = '/galafy';
          }
        } else {
          return data;
        }
      });

    console.log(response);
    return response;
  };

  const getTopArtists = async () => {
    return (await getTopOfType('artists')) as TopArtists;
  };

  const getTopTracks = async () => {
    return (await getTopOfType('tracks')) as TopTracks;
  };
</script>

{#await getTopArtists() then topArtists}
  <!-- Grid with col limit of 10 -->
  <div class="grid grid-cols-5">
    {#each topArtists.items as artist}
      <p>{artist.name}</p>
    {/each}
  </div>
{/await}
<br />
{#await getTopTracks() then topTracks}
  <!-- Grid with col limit of 10 -->
  <div class="grid grid-cols-3">
    {#each topTracks.items as track}
      <p>{track.name} - {track.album.name}</p>
    {/each}
  </div>
{/await}
