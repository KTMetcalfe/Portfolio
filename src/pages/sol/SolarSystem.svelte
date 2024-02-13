<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import Planet from "./Planet.svelte";
  import { type PerspectiveCamera, Vector3, MathUtils, Euler } from "three";
  import { PlanetStore, SolStore } from "../../components/stores/SolStore";
  import Stars from "./Stars.svelte";
  import { tweened } from "svelte/motion";
  import { OrbitControls, interactivity } from "@threlte/extras";

  $: revTime = $SolStore.secPerYear;

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControls;

  let textLookAt: Vector3 | null;

  let cameraPos: Vector3 = new Vector3(150, 150, 150);

  // Updates object every frame
  // Seconds (60 frames) per year (1 earth revolution)
  useTask(() => {
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
      });
      return state;
    });

    // Locks camera to target
    if ($SolStore.selected.name !== null) {
      const selectedPlanet = $PlanetStore.get($SolStore.selected.name);
      if (selectedPlanet === undefined) throw new Error("Planet doesn't exist");

      // Moves camera to 1.(5 * planet's width as fraction of distance)
      const goodPos = new Vector3(
        selectedPlanet.position.x,
        selectedPlanet.position.y + 2 * selectedPlanet.size,
        selectedPlanet.position.z
      ).multiplyScalar(
        1 +
          10 *
            (selectedPlanet.size /
              selectedPlanet.position.distanceTo(new Vector3(0, 0, 0)))
      );

      if ($SolStore.selected.shouldLerp === true) {
        cameraPos = cameraPos.lerp(goodPos, 0.1);
        // TODO: Make lerp look better
        setTimeout(() => {
          $SolStore.selected.shouldLerp = false;
        }, 750);
      } else {
        cameraPos = goodPos;
      }

      textLookAt = goodPos;
    } else {
      textLookAt = null;
    }

    controlsRef.update();
    cameraRef.updateProjectionMatrix();
  });

  const fov = tweened(48);

  $: {
    if ($SolStore.selected.name !== null) {
      fov.set(72);
    } else {
      fov.set(48);
    }
  }

  interactivity();
</script>

<T.PerspectiveCamera
  bind:ref={cameraRef}
  makeDefault
  position={[cameraPos.x, cameraPos.y, cameraPos.z]}
  fov={$fov}
>
  <OrbitControls
    bind:ref={controlsRef}
    enableRotate={$SolStore.selected.name === null}
    enableZoom={$SolStore.selected.name === null}
    enablePan={false}
    enableDamping={true}
    dampingFactor={0.1}
  />
</T.PerspectiveCamera>

<T.AmbientLight intensity={0.25} />
<T.PointLight intensity={2} />

<Stars radius={250} />

{#each [...$PlanetStore] as planet, i (planet[0])}
  <Planet
    position={planet[1].position}
    rotation={planet[1].rotation}
    textLookAt={textLookAt || new Vector3(0, planet[1].size + 2, 0)}
    size={planet[1].size}
    name={planet[0]}
  />
{/each}
