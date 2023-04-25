<script lang="ts">
  import type {
    DetailedArtistItem,
    DetailedTrackItem,
    TopArtists,
    TopTracks,
  } from '../../components/helpers/spotify';
  import { getTokensFromRefresh } from '../../components/helpers/spotify';
  import { Canvas, T, OrbitControls } from '@threlte/core';
  import { degToRad } from 'three/src/math/MathUtils';
  import ArtistSystem from './ArtistSystem.svelte';
  import { onMount } from 'svelte';
  import { GalaxyStore } from '../../components/stores/GalaxyStore';

  const getTopOfType = async (top_type: 'artists' | 'tracks') => {
    const response: TopArtists | TopTracks = await fetch(
      `https://api.spotify.com/v1/me/top/${top_type}?limit=50`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
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
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
    });

    return response;
  };

  const getArtistTracks = async (artist_id: string) => {
    const response: { tracks: Array<DetailedTrackItem> } = await fetch(
      `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?country=US`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
    });

    return response;
  };

  const createArtistSystems = () => {
    getTopArtists().then((topArtists) => {
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist);
        // await new Promise((r) => setTimeout(r, 200));
        // await getArtistTracks(artist.id).then((tracks) => {
        //   GalaxyStore.addSystem(artist, tracks.tracks);
        // });

        getRelatedArtists(artist.id).then((relatedArtists) => {
          relatedArtists.artists = relatedArtists.artists.filter(
            (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
          );
          // Change amount of related artists to add here
          relatedArtists.artists.slice(0, 20).map(async (relatedArtist) => {
            GalaxyStore.addSystem(relatedArtist);
            // await new Promise((r) => setTimeout(r, 250));
            // await getArtistTracks(relatedArtist.id).then((tracks) => {
            //   GalaxyStore.addSystem(relatedArtist, tracks.tracks);
            // });
          });
        });
      });
    });

    getTopTracks().then((topTracks) => {
      topTracks.items.forEach((track) => {
        const artist = track.artists[0];
        if (GalaxyStore.containsSystem(artist.id)) {
          GalaxyStore.addPlanet(track);
        }
      });
    });
  };

  onMount(() => {
    createArtistSystems();

    setTimeout(() => {
      console.log($GalaxyStore);
    }, 10000);

    return () => {
      GalaxyStore.clear();
    };
  });
</script>

<div class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black">
  <Canvas>
    <T.PerspectiveCamera makeDefault fov={72} position={[750, 750, 0]}>
      <OrbitControls maxPolarAngle={degToRad(80)} />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    <!-- {#each [...$SolarSystemStore] as system, i (system.artist.id)}
      <ArtistSystem
        artist={system.artist}
        position={system.position}
        color={`#${Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, '0')}`}
      />
    {/each} -->
    {#each [...$GalaxyStore.systems] as system, i (system[0])}
      <ArtistSystem
        artist={system[1].artist}
        position={system[1].position}
        color={`#${Math.floor(Math.random() * 0xffffff)
          .toString(16)
          .padStart(6, '0')}`}
        planets={system[1].planets}
      />
    {/each}
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
