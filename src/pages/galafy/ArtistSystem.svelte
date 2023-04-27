<script lang="ts">
  import { T, InteractiveObject, useTexture } from '@threlte/core';
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
  export let isSelected = false;

  export let scale = 1;
  let scaleMultiple = tweened(1, { duration: 100 });
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
    {#if isSelected && artist.images.length > 0}
      <T.MeshStandardMaterial map={useTexture(artist.images[0].url)} />
    {:else if color !== ''}
      <T.MeshStandardMaterial color={new Color(`#${color.replace('#', '')}`)} />
    {:else}
      <T.MeshStandardMaterial color={new Color('#666666')} />
    {/if}
  </T.Mesh>
  <!-- Surrounding song planets -->
  {#each [...planets] as planet, i (planet[0])}
    <T.Mesh position={planet[1].position} scale={scale * 0.5} let:ref>
      <InteractiveObject object={ref} interactive />
      <T.SphereGeometry args={[1, 32, 32]} />
      {#if isSelected && planet[1].track.album.images.length > 0}
        <T.MeshStandardMaterial
          map={useTexture(planet[1].track.album.images[0].url)}
        />
      {:else if color !== ''}
        <T.MeshStandardMaterial
          color={new Color(`#${color.replace('#', '')}`)}
        />
      {:else}
        <T.MeshStandardMaterial color={new Color('#666666')} />
      {/if}
    </T.Mesh>
  {/each}
</T.Group>
