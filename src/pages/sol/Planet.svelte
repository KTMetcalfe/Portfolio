<script lang="ts">
  import { T, useFrame, useTexture, InteractiveObject } from '@threlte/core';
  import { Euler, MathUtils, Mesh, Vector3 } from 'three';

  import sunImg from '../../images/2k_sun.jpg';
  import mercuryImg from '../../images/2k_mercury.jpg';
  import venusImg from '../../images/2k_venus_atmosphere.jpg';
  import earthImg from '../../images/2k_earth_daymap.jpg';
  import marsImg from '../../images/2k_mars.jpg';
  import jupiterImg from '../../images/2k_jupiter.jpg';
  import saturnImg from '../../images/2k_saturn.jpg';
  import uranusImg from '../../images/2k_uranus.jpg';
  import neptuneImg from '../../images/2k_neptune.jpg';

  export let distance: number;
  export let size: number;
  export let speed: number;
  export let rotation: number;
  export let name: string;
  export let isSelected: boolean;
  export let selectedRef: Mesh | null;
  export let clickCallback: (mesh: Mesh) => void;

  console.log('Planet', name, 'isSelected', isSelected, 'selectedRef', selectedRef, size, distance, speed, rotation);

  let planetRef: Mesh;
  let textLookAt: Vector3;

  // Updates object every frame
  useFrame(() => {
    const eu = new Euler(
      MathUtils.degToRad(0),
      MathUtils.degToRad(speed === 0 ? 0 : 360 / speed / 60),
      MathUtils.degToRad(0)
    );

    const offset = planetRef.position.applyEuler(eu);

    if (selectedRef !== null && selectedRef.geometry.boundingSphere !== null) {
      const goodPos = new Vector3(
        selectedRef.position.x,
        selectedRef.position.y +
          2 * (selectedRef.geometry.boundingSphere?.radius || 1),
        selectedRef.position.z
      ).multiplyScalar(
        1 +
          5 *
            ((selectedRef.geometry.boundingSphere?.radius || 1) /
              selectedRef.position.distanceTo(new Vector3(0, 0, 0)))
      );
      textLookAt = goodPos;
    } else {
      textLookAt = new Vector3(0, offset.y + size * 2, 0);
    }

    planetRef.rotation.set(
      planetRef.rotation.x,
      (planetRef.rotation.y += MathUtils.degToRad(360 / rotation)),
      planetRef.rotation.z
    );
  }, {
    autostart: false,
  });

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

<T.Mesh position={[0, 0, -distance]} let:ref={planetRef}>
  <InteractiveObject
    object={planetRef}
    interactive
    on:click={() => clickCallback(planetRef)}
  />
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
