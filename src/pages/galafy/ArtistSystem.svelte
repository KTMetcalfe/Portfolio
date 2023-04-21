<script lang="ts">
  import { T, InteractiveObject, useTexture, useFrame } from '@threlte/core';
  import type { DetailedArtistItem } from '../../components/helpers/spotify';
  import { Color } from 'three';

  export let artist: DetailedArtistItem;
  export let position: [number, number, number];
  export let color: string = '';

  export let scale = 1;
  let scaleMultiple = 1;

  useFrame(() => {
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
  });
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
  {:else if artist.images.length === 0}
    <T.MeshStandardMaterial color={new Color('#000000')} />
  {:else}
    <T.MeshStandardMaterial map={useTexture(artist.images[0].url)} />
  {/if}
</T.Mesh>
