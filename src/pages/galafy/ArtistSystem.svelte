<script lang="ts">
  import { T, InteractiveObject, useTexture, useFrame } from '@threlte/core';
  import type {
    DetailedArtistItem,
    DetailedTrackItem,
  } from '../../components/helpers/spotify';
  import { Color } from 'three';
  import { tweened } from 'svelte/motion';

  export let artist: DetailedArtistItem;
  export let position: [number, number, number];
  export let color: string = '';
  export let planets = new Map<
    DetailedTrackItem['id'],
    {
      track: DetailedTrackItem;
      position: [number, number, number];
    }
  >();
  export let clickCallback: () => void = () => {};

  export let scale = 1;
  let scaleMultiple = tweened(1, { duration: 100 });

  export const { start, stop, started } = useFrame(
    () => {
      const dist = Math.sqrt(
        position[0] ** 2 + position[1] ** 2 + position[2] ** 2
      );
      const rotChange = -0.25;
      // const rotChange = -5 / dist;

      const newX =
        position[0] * Math.cos(rotChange / dist) -
        position[2] * Math.sin(rotChange / dist);
      const newZ =
        position[0] * Math.sin(rotChange / dist) +
        position[2] * Math.cos(rotChange / dist);

      position[0] = newX;
      position[2] = newZ;
    },
    {
      autostart: false,
    }
  );
</script>

<T.Group {position}>
  <!-- Artist as sun -->
  <T.Mesh scale={scale * $scaleMultiple} let:ref>
    <InteractiveObject
      object={ref}
      interactive
      on:pointerenter={() => {
        $scaleMultiple = 1.5;
      }}
      on:pointerleave={() => {
        $scaleMultiple = 1;
      }}
      on:click={clickCallback}
    />
    <T.SphereGeometry args={[1, 32, 32]} />
    {#if color !== ''}
      <T.MeshStandardMaterial color={new Color(`#${color.replace('#', '')}`)} />
    {:else if artist.images.length === 0}
      <T.MeshStandardMaterial color={new Color('#666666')} />
    {:else}
      <T.MeshStandardMaterial map={useTexture(artist.images[0].url)} />
    {/if}
  </T.Mesh>
  <!-- Surrounding song planets -->
  {#each [...planets] as planet, i (planet[0])}
    <T.Mesh position={planet[1].position} scale={scale * 0.5} let:ref>
      <InteractiveObject object={ref} interactive />
      <T.SphereGeometry args={[1, 32, 32]} />
      {#if color !== ''}
        <T.MeshStandardMaterial
          color={new Color(`#${color.replace('#', '')}`)}
        />
      {:else if planet[1].track.album.images.length === 0}
        <T.MeshStandardMaterial color={new Color('#666666')} />
      {:else}
        <T.MeshStandardMaterial
          map={useTexture(planet[1].track.album.images[0].url)}
        />
      {/if}
    </T.Mesh>
  {/each}
</T.Group>
