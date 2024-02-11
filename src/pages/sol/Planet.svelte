<script lang="ts">
  import { T, useTexture, InteractiveObject } from '@threlte/core';
  import { Text } from '@threlte/extras';
  import { SolStore } from '../../components/stores/SolStore';
  import { Vector3 } from 'three';

  import sunImg from '../../images/2k_sun.jpg';
  import mercuryImg from '../../images/2k_mercury.jpg';
  import venusImg from '../../images/2k_venus_atmosphere.jpg';
  import earthImg from '../../images/2k_earth_daymap.jpg';
  import marsImg from '../../images/2k_mars.jpg';
  import jupiterImg from '../../images/2k_jupiter.jpg';
  import saturnImg from '../../images/2k_saturn.jpg';
  import uranusImg from '../../images/2k_uranus.jpg';
  import neptuneImg from '../../images/2k_neptune.jpg';

  export let position: Vector3;
  export let size: number;
  export let rotation: Vector3;
  export let name: string;

  export let textLookAt: Vector3;

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

<T.Group position={[position.x, position.y, position.z]}>
  {#if name !== 'Sun' && $SolStore.selected.name !== name}
    <Text
      text={name}
      anchorX="center"
      anchorY="bottom"
      position={new Vector3(0, size + 2, 0)}
      scale={size * 10 + 15}
      lookAt={textLookAt}
      color="white"
    />
  {/if}
  {#if name === 'Saturn'}
  <!-- TODO: Add rings -->
  {/if}
  <T.Mesh rotation={[rotation.x, rotation.y, rotation.z]} let:ref={planetRef}>
    {#if name !== 'Sun'}
      <InteractiveObject
        object={planetRef}
        interactive
        on:click={() => {
          if ($SolStore.selected.name !== name) {
            SolStore.select(name, true);
          }
        }}
      />
    {/if}
    <T.SphereGeometry args={[size, 64, 64]} />
    {#if map != null}
      <T.MeshStandardMaterial
        map={useTexture(map)}
        emissive={name === 'Sun' ? 'red' : 'black'}
        emissiveIntensity={0.05}
      />
    {:else}
      <T.MeshLambertMaterial color="pink" />
    {/if}
  </T.Mesh>
</T.Group>
