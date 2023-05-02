<script lang="ts">
  import { T, useFrame, OrbitControls } from '@threlte/core';
  import Planet from './Planet.svelte';
  import { type Mesh, type PerspectiveCamera, Vector3 } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';

  export let secPerYear: number;
  export let selectedRef: Mesh | null;
  export let shouldLerp: boolean;

  // Seconds (60 frames) per year (1 earth revolution)
  const revTime = secPerYear;

  // Constants for comparison
  const earthDist = 100;
  const earthSize = 1;

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControlsType;

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
      autostart: false,
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

<Planet
  distance={0}
  size={20 * earthSize}
  speed={0}
  rotation={revTime * 27}
  name="Sun"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={0.39 * earthDist}
  size={0.38 * earthSize}
  speed={revTime / 0.62}
  rotation={revTime * 58.67}
  name="Mercury"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={0.72 * earthDist}
  size={0.95 * earthSize}
  speed={revTime / 0.24}
  rotation={revTime * 243.02}
  name="Venus"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={earthDist}
  size={earthSize}
  speed={revTime}
  rotation={revTime * 0.99}
  name="Earth"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<!-- Distance is SCALED DOWN for the last five planets -->
<Planet
  distance={(1.52 * earthDist) / 1.25}
  size={0.53 * earthSize}
  speed={revTime / 1.88}
  rotation={revTime * 1.02}
  name="Mars"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={(5.2 * earthDist) / 3}
  size={10.97 * earthSize}
  speed={revTime / 11.86}
  rotation={revTime * 0.42}
  name="Jupiter"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={(9.54 * earthDist) / 4}
  size={9.14 * earthSize}
  speed={revTime / 29.46}
  rotation={revTime * 0.44}
  name="Saturn"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={(19.18 * earthDist) / 6}
  size={3.98 * earthSize}
  speed={revTime / 164.79}
  rotation={revTime * 0.72}
  name="Uranus"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
<Planet
  distance={(30.06 * earthDist) / 8}
  size={3.86 * earthSize}
  speed={revTime / 248.59}
  rotation={revTime * 0.67}
  name="Neptune"
  isSelected={false}
  {selectedRef}
  clickCallback={(mesh) => {
    selectedRef = mesh;
    shouldLerp = true;
  }}
/>
