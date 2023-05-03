<script lang="ts">
  import { T, useTexture, InteractiveObject } from '@threlte/core';

  import sunImg from '../../images/2k_sun.jpg';
  import mercuryImg from '../../images/2k_mercury.jpg';
  import venusImg from '../../images/2k_venus_atmosphere.jpg';
  import earthImg from '../../images/2k_earth_daymap.jpg';
  import marsImg from '../../images/2k_mars.jpg';
  import jupiterImg from '../../images/2k_jupiter.jpg';
  import saturnImg from '../../images/2k_saturn.jpg';
  import uranusImg from '../../images/2k_uranus.jpg';
  import neptuneImg from '../../images/2k_neptune.jpg';
  import { SolStore } from '../../components/stores/SolStore';
  import type { Vector3 } from 'three';

  export let position: Vector3;
  export let size: number;
  export let rotation: Vector3;
  export let name: string;

  // TODO: Incorporate text
  let textLookAt: Vector3;

  // Chooses appropriate planet texture
  let map: string | null = null;
  switch (name) {
    default:
      map = sunImg;
      break;
    case 'Mercury':
      map = mercuryImg;
      break;
    case 'Venus':
      map = venusImg;
      break;
    case 'Earth':
      map = earthImg;
      break;
    case 'Mars':
      map = marsImg;
      break;
    case 'Jupiter':
      map = jupiterImg;
      break;
    case 'Saturn':
      map = saturnImg;
      break;
    case 'Uranus':
      map = uranusImg;
      break;
    case 'Neptune':
      map = neptuneImg;
      break;
  }
</script>

<T.Mesh
  position={[position.x, position.y, position.z]}
  rotation={[rotation.x, rotation.y, rotation.z]}
  let:ref={planetRef}
>
  {#if name !== 'Sun'}
    <InteractiveObject
      object={planetRef}
      interactive
      on:click={() => SolStore.select(name, true)}
    />
  {/if}
  <!-- TODO: Incorporate text -->
  <!-- {#if name !== 'Sun' && !isSelected}
    <Text
      position={new Vector3(0, size + 5, 0)}
      scale={new Vector3(size * 10, size * 10, size * 10)}
      lookAt={textLookAt}
      color="white"
    >
      {name}
    </Text>
  {/if} -->
  <T.SphereGeometry args={[size]} />
  {#if map != null}
    <T.MeshStandardMaterial map={useTexture(map)} />
  {:else}
    <T.MeshLambertMaterial color="pink" />
  {/if}
</T.Mesh>
