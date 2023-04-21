<script lang="ts">
  import { T, InteractiveObject, useTexture } from '@threlte/core';
  import type { DetailedArtistItem } from '../../components/helpers/spotify';
  import { Color } from 'three';

  export let artist: DetailedArtistItem;
  export let position: [number, number, number];
  export let color: string = '';
  
  export let scale = 1;
  let scaleMultiple = 1;
</script>

<T.Mesh {position} scale={scale * scaleMultiple} let:ref>
  <InteractiveObject
    object={ref}
    interactive
    on:pointerenter={() => {
      scaleMultiple = 1.5;
    }}
    on:pointerleave={() => {
      scaleMultiple = 1;
    }}
  />
  <T.SphereGeometry args={[1, 32, 32]} />
  {#if color !== ''}
    <T.MeshStandardMaterial color={new Color(`#${color.replace('#', '')}`)} />
  {:else}
    <T.MeshStandardMaterial map={useTexture(artist.images[0].url)} />
  {/if}
</T.Mesh>
