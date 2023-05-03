<script lang="ts">
  import { T, useFrame, OrbitControls } from '@threlte/core';
  import Planet from './Planet.svelte';
  import { type PerspectiveCamera, Vector3, MathUtils, Euler } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';
  import { PlanetStore, SolStore } from '../../components/stores/SolStore';

  $: revTime = $SolStore.secPerYear;

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControlsType;

  // Updates object every frame
  // Seconds (60 frames) per year (1 earth revolution)
  useFrame(
    (ctx) => {
      PlanetStore.update((state) => {
        state.forEach((planet, name) => {
          // Complete 1 orbit (365 / orbitRatio) in 1 year (revTime)
          const offsetEuler = new Euler(
            MathUtils.degToRad(0),
            MathUtils.degToRad(
              planet.orbitRatio === 0
                ? 0
                : ((360 / revTime / 60) * 365) / planet.orbitRatio
            ),
            MathUtils.degToRad(0)
          );

          const newPos = planet.position.clone().applyEuler(offsetEuler);
          planet.position.copy(newPos);

          // Complete (365 / spinRatio) rotations in 1 year (revTime)
          planet.rotation.set(
            planet.rotation.x,
            (planet.rotation.y += MathUtils.degToRad(
              ((360 / revTime / 60) * 365) / planet.spinRatio
            )),
            planet.rotation.z
          );

          // TODO: Update text lookAt
          //   textLookAt = goodPos;
          // } else {
          //   textLookAt = new Vector3(0, offset.y + size * 2, 0);
          // }
        });
        return state;
      });

      controlsRef.update();

      // Locks camera to target
      if ($SolStore.selected.name !== null) {
        const selectedPlanet = $PlanetStore.get($SolStore.selected.name);
        if (selectedPlanet === undefined)
          throw new Error("Planet doesn't exist");

        cameraRef.lookAt(0, 0, 0);
        // Moves camera to 1.(5 * planet's width as fraction of distance)
        const goodPos = new Vector3(
          selectedPlanet.position.x,
          selectedPlanet.position.y + 2 * selectedPlanet.size,
          selectedPlanet.position.z
        ).multiplyScalar(
          1 +
            5 *
              (selectedPlanet.size /
                selectedPlanet.position.distanceTo(new Vector3(0, 0, 0)))
        );

        if ($SolStore.selected.shouldLerp === true) {
          cameraRef.position.lerp(goodPos, 0.1);
          setTimeout(() => {
            $SolStore.selected.shouldLerp = false;
          }, 750);
        } else {
          cameraRef.position.copy(goodPos);
        }
        cameraRef.updateProjectionMatrix();
      }
      // TODO: Figure out what this is for
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

<!-- TODO: Create star particles -->
<!-- <Stars radius={250} /> -->
<T.PerspectiveCamera
  bind:ref={cameraRef}
  makeDefault
  position={[150, 150, 150]}
>
  <OrbitControls
    bind:controls={controlsRef}
    enableZoom={true}
    enablePan={false}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.25} />
<T.PointLight intensity={2} />

{#each [...$PlanetStore] as planet, i (planet[0])}
  <Planet
    position={planet[1].position}
    rotation={planet[1].rotation}
    size={planet[1].size}
    name={planet[0]}
  />
{/each}
