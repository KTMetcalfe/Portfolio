<script lang="ts">
  import { T, useFrame, OrbitControls } from '@threlte/core';
  import Planet from './Planet.svelte';
  import { type Mesh, type PerspectiveCamera, Vector3 } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';

  export let secPerYear: number;
  export let selectedRef: Mesh | null;
  export let shouldLerp: boolean;
  export let selectedName: string;

  // Seconds (60 frames) per year (1 earth revolution)
  $: revTime = secPerYear;

  // Constants for comparison
  const earthDist = 100;
  const earthSize = 1;

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControlsType;


  // Distance is SCALED DOWN for the last five planets
  $: planets = [
    {
      name: 'Sun',
      distance: 0,
      size: 20 * earthSize,
      speed: 0,
      rotation: revTime * 27,
    },
    {
      name: 'Mercury',
      distance: 0.39 * earthDist,
      size: 0.38 * earthSize,
      speed: revTime * 0.62,
      rotation: revTime * 58.67,
    },
    {
      name: 'Venus',
      distance: 0.72 * earthDist,
      size: 0.95 * earthSize,
      speed: revTime * 0.24,
      rotation: revTime * 243.02,
    },
    {
      name: 'Earth',
      distance: earthDist,
      size: earthSize,
      speed: revTime,
      rotation: revTime * 0.99,
    },
    {
      name: 'Mars',
      distance: 1.52 * earthDist,
      size: 0.53 * earthSize,
      speed: revTime * 1.88,
      rotation: revTime * 1.02,
    },
    {
      name: 'Jupiter',
      distance: 5.2 * earthDist,
      size: 10.97 * earthSize,
      speed: revTime * 11.86,
      rotation: revTime * 0.42,
    },
    {
      name: 'Saturn',
      distance: 9.54 * earthDist,
      size: 9.14 * earthSize,
      speed: revTime * 29.46,
      rotation: revTime * 0.45,
    },
    {
      name: 'Uranus',
      distance: (19.18 * earthDist) / 6,
      size: 3.98 * earthSize,
      speed: revTime * 164.79,
      rotation: revTime * 0.72,
    },
    {
      name: 'Neptune',
      distance: (30.06 * earthDist) / 8,
      size: 3.86 * earthSize,
      speed: revTime * 248.59,
      rotation: revTime * 0.67,
    },
  ];

  useFrame(
    () => {
      controlsRef.update();

      // Locks camera to target
      if (
        selectedRef !== null &&
        selectedRef.geometry.boundingSphere !== null
      ) {
        cameraRef.lookAt(0, 0, 0);
        // Moves camera to 1.(5 * planet's width as fraction of distance)
        const goodPos = new Vector3(
          selectedRef.position.x,
          selectedRef.position.y +
            2 * selectedRef.geometry.boundingSphere.radius,
          selectedRef.position.z
        ).multiplyScalar(
          1 +
            5 *
              (selectedRef.geometry.boundingSphere.radius /
                selectedRef.position.distanceTo(new Vector3(0, 0, 0)))
        );

        if (shouldLerp === true) {
          cameraRef.position.lerp(goodPos, 0.1);
          setTimeout(() => {
            shouldLerp = false;
          }, 750);
        } else {
          cameraRef.position.copy(goodPos);
        }
        cameraRef.updateProjectionMatrix();
      }
      // else {
      //   camera.lookAt(0, 0, 0);
      //   camera.position.lerp(new THREE.Vector3(50, 50, 50), .1);
      //   camera.updateProjectionMatrix();
      // }
    },
    {
      autostart: true,
    }
  );
</script>

<!-- <Stars radius={250} /> -->
<T.PerspectiveCamera
  bind:ref={cameraRef}
  makeDefault
  fov={72}
  position={[50, 50, 0]}
>
  <OrbitControls
    bind:controls={controlsRef}
    enableZoom={true}
    enablePan={true}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.25} />
<T.PointLight intensity={2} />

{#each planets as planet, i (planet.name)}
  <Planet
    distance={planet.distance}
    size={planet.size}
    speed={planet.speed}
    rotation={planet.rotation}
    name={planet.name}
    isSelected={planet.name === selectedName}
    {selectedRef}
    clickCallback={(mesh) => {
      selectedName = planet.name;
      selectedRef = mesh;
      shouldLerp = true;
    }}
  />
{/each}
