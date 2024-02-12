<script lang="ts">
  import { T } from '@threlte/core';
  import type {
    DetailedArtistItem,
    DetailedTrackItem,
  } from '../../components/helpers/spotify';
  import { Color } from 'three';
  import { tweened } from 'svelte/motion';
  import { Instance, useTexture } from '@threlte/extras';

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
  <!-- TEMPORARY Identifier for top artist -->
  {#if isTopArtist}
    <T.Mesh position={[0, 5, 0]} scale={scale * 0.5}>
      <T.SphereGeometry args={[1, 32, 32]} />
      <T.MeshStandardMaterial color={new Color('#ff0000')} />
    </T.Mesh>
  {/if}
  {#if isSelected}
    <!-- Artist as sun -->
    <T.Mesh scale={scale * $scaleMultiple}>
      <T.SphereGeometry args={[1, 32, 32]} />
      {#if isSelected && artist.images.length > 0}
        {@const texture = useTexture(artist.images[0].url)}
        {#await texture then map}
          <T.MeshStandardMaterial {map} />
        {/await}
      {:else if color !== ''}
        <T.MeshStandardMaterial
          color={new Color(`#${color.replace('#', '')}`)}
        />
      {:else}
        <T.MeshStandardMaterial color={new Color('#666666')} />
      {/if}
    </T.Mesh>
    <!-- Surrounding song planets -->
    {#each [...planets] as planet, i (planet[0])}
      <T.Mesh position={planet[1].position} scale={scale * 0.5}>
        <T.SphereGeometry args={[1, 32, 32]} />
        {#if isSelected && planet[1].track.album.images.length > 0}
          {@const texture = useTexture(planet[1].track.album.images[0].url)}
          {#await texture then map}
            <T.MeshStandardMaterial {map} />
          {/await}
        {:else if color !== ''}
          <T.MeshStandardMaterial
            color={new Color(`#${color.replace('#', '')}`)}
          />
        {:else}
          <T.MeshStandardMaterial color={new Color('#666666')} />
        {/if}
      </T.Mesh>
    {/each}
  {/if}
  <!-- Selector Instance -->
  <Instance
    id="selector"
    scale={scale * (isSelected ? 0.5 : 10)}
    on:pointerenter={() => {
      $scaleMultiple = 9;
    }}
    on:pointerleave={() => {
      $scaleMultiple = 1;
    }}
    on:click={clickCallback}
  />
  <!-- Simple star instance -->
  <Instance
    id="star"
    scale={scale * (isSelected ? 0.5 : $scaleMultiple)}
    color={new Color(`#${color.replace('#', '')}`)}
  />
</T.Group>
