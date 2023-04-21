<script lang="ts">
  import type {
    DetailedArtistItem,
    TopArtists,
    TopTracks,
  } from '../../components/helpers/spotify';
  import { getTokensFromRefresh } from '../../components/helpers/spotify';
  import { Canvas, T, OrbitControls, Fog } from '@threlte/core';
  import { degToRad } from 'three/src/math/MathUtils';
  import ArtistSystem from './ArtistSystem.svelte';
  import { onMount } from 'svelte';
  import { ArtistSystemStore } from '../../components/stores/GalaxyStore';

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

    return response;
  };

  const getTopArtists = async () => {
    return (await getTopOfType('artists')) as TopArtists;
  };

  const getTopTracks = async () => {
    return (await getTopOfType('tracks')) as TopTracks;
  };

  const getRelatedArtists = async (artist_id: string) => {
    const response: { artists: Array<DetailedArtistItem> } = await fetch(
      `https://api.spotify.com/v1/artists/${artist_id}/related-artists`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    )
      .then((res) => res.json())
      .then(async (data) => {
        if (data.error) {
          const isAuth = await getTokensFromRefresh();
          if (!isAuth) {
            window.location.href = '/galafy';
          }
        } else {
          return data;
        }
      });

    return response;
  };

  const createArtistSystems = () => {
    getTopArtists().then((topArtists) => {
      topArtists.items.map(async (artist) => {
        ArtistSystemStore.add(artist);

        getRelatedArtists(artist.id).then((relatedArtists) => {
          relatedArtists.artists = relatedArtists.artists.filter(
            (relatedArtist) => {
              return !$ArtistSystemStore.has(relatedArtist.id);
            }
          );
          relatedArtists.artists.slice(0, 20).forEach((relatedArtist) => {
            ArtistSystemStore.add(relatedArtist);
          });
        });
      });
    });
  };

  onMount(() => {
    createArtistSystems();

    return () => {
      ArtistSystemStore.clear();
    };
  });
</script>

<div class="w-full h-[calc(100vh-4rem)] overflow-hidden">
  <Canvas>
    <T.PerspectiveCamera makeDefault fov={48} position={[0, 500, 0]}>
      <OrbitControls maxPolarAngle={degToRad(80)} />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    <!-- {#await createArtistSystems()} -->
    {#each [...$ArtistSystemStore] as system, i (system[0])}
      <ArtistSystem
        artist={system[1].artist}
        position={[system[1].x, system[1].y, system[1].z]}
        color={'#666666'}
      />
    {/each}
    <!-- {/await} -->
    <!-- <Fog color={'red'} near={0} far={500} /> -->
  </Canvas>
</div>
<br />
{#await getTopArtists() then topArtists}
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10"
  >
    {#each topArtists.items as artist}
      <div class="flex gap-2">
        <img
          class="self-start"
          src={artist.images[0].url}
          alt={artist.name}
          width="100"
          height="100"
        />
        <p>{artist.name}</p>
      </div>
    {/each}
  </div>
{/await}
<br />
{#await getTopTracks() then topTracks}
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
    {#each topTracks.items as track}
      <div class="flex gap-2">
        <img
          class="self-start"
          src={track.album.images[0].url}
          alt={track.album.name}
          width="100"
          height="100"
        />
        <p>{track.name} - {track.album.name}</p>
      </div>
    {/each}
  </div>
{/await}
