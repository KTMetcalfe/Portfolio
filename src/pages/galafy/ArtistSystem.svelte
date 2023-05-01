<script lang="ts">
  import { T, InteractiveObject, useTexture, Instance } from '@threlte/core';
  import type {
    DetailedArtistItem,
    DetailedTrackItem,
  } from '../../components/helpers/spotify';
  import { Color, Vector3 } from 'three';
  import { tweened } from 'svelte/motion';

  export let artist: DetailedArtistItem;
  export let position: [number, number, number];
  export let color: string = '';
  export let planets: Map<
    DetailedTrackItem['id'],
    {
      track: DetailedTrackItem;
      position: [number, number, number];
    }
  >;
  export let clickCallback: () => void = () => {};
  export let isSelected = false;
  export let isTopArtist = false;

  export let scale = 1;
  let scaleMultiple = tweened(1, { duration: 100 });
</script>

<T.Group {position}>
  <!-- Identifier for top artist -->
  {#if isTopArtist}
    <T.Mesh position={[0, 5, 0]} scale={scale * 0.5} let:ref>
      <T.SphereGeometry args={[1, 32, 32]} />
      <T.MeshStandardMaterial color={new Color('#ff0000')} />
    </T.Mesh>
  {/if}
  <!-- Artist as sun -->
  <Instance
    id="star"
    scale={scale * $scaleMultiple}
    on:pointerenter={() => {
      $scaleMultiple = 1.5;
    }}
    on:pointerleave={() => {
      $scaleMultiple = 1;
    }}
    on:click={clickCallback}
  >
    {#if isSelected && artist.images.length > 0}
      <T.MeshStandardMaterial map={useTexture(artist.images[0].url)} />
    {:else if color !== ''}
      <T.MeshStandardMaterial color={new Color(`#${color.replace('#', '')}`)} />
    {/if}
  </Instance>
  <!-- Surrounding song planets -->
  {#if isSelected}
    {#each [...planets] as planet, i (planet[0])}
      <Instance
        id="planet"
        position={new Vector3(...planet[1].position)}
        scale={scale * 0.5}
      >
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
      </Instance>
    {/each}
  {/if}
</T.Group>
