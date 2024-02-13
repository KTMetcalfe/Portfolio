<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  import SpotifyGalaxy from "./SpotifyGalaxy.svelte";
  import { GalaxyStore } from "../../components/stores/GalaxyStore";
  import { OrbitControls } from "@threlte/extras";
  import {
    getRelatedArtists,
    getTopArtists,
    getTopTracks,
  } from "../helpers/spotify";
  import { OrbitControls as JSMOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  const createArtistSystems = async () => {
    const topArtists = await getTopArtists();
    await Promise.all(
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist, true);

        const relatedArtists = await getRelatedArtists(artist.id);
        relatedArtists.artists = relatedArtists.artists.filter(
          (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
        );
        // Change amount of related artists to add here
        relatedArtists.artists.slice(0, 20).map((relatedArtist) => {
          GalaxyStore.addSystem(relatedArtist, false);
        });
      })
    );

    const topTracks = await getTopTracks();
    topTracks.items.map((track) => {
      const artist = track.artists[0];
      if (GalaxyStore.containsSystem(artist.id)) {
        GalaxyStore.addPlanet(track, true);
      }
    });
  };

  let galaxy: SpotifyGalaxy;
  let controls: JSMOrbitControls;
</script>

{#await createArtistSystems()}
  <div class="w-full h-full flex justify-center items-center">
    <h1 class="text-2xl">Loading galaxy...</h1>
  </div>
{:then}
  <div
    class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
    role="application"
    on:contextmenu|preventDefault={() => {
      galaxy.resetCameraFocus();
    }}
  >
    <Canvas>
      <T.PerspectiveCamera
        makeDefault
        fov={72}
        position={[750, 750, 0]}
        lookAt.x={0}
        lookAt.y={0}
        lookAt.z={0}
      >
        <OrbitControls enablePan={false} bind:ref={controls} />
      </T.PerspectiveCamera>

      <SpotifyGalaxy bind:this={galaxy} {controls} />
    </Canvas>
  </div>
{/await}
