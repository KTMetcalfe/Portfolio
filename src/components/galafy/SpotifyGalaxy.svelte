<script lang="ts">
  import { getArtistTracks } from "../helpers/spotify";
  import ArtistSystem from "./ArtistSystem.svelte";
  import { onMount } from "svelte";
  import { GalaxyStore } from "../stores/GalaxyStore";
  import {
    MeshBasicMaterial,
    MeshStandardMaterial,
    SphereGeometry,
    Vector3,
  } from "three";
  import { customLerp, quinticEaseInOut } from "../helpers/animation";
  import { InstancedMesh, interactivity } from "@threlte/extras";
  import { T, useThrelte } from "@threlte/core";
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

  export let controls: OrbitControls;

  export const resetCameraFocus = async (onPosition?: () => void) => {
    if (isCameraFocusing) return;
    isCameraFocusing = true;

    await customLerp(
      $camera.position.clone(),
      new Vector3(750, 750, 0),
      750,
      (current) => {
        $camera.position.copy(current);
        controls.update();
      },
      quinticEaseInOut
    ).then(async () => {
      if (onPosition) {
        onPosition();
      } else {
        selectedSystemId = null;
        GalaxyStore.resetPositions(200);
      }

      await customLerp(
        controls.target.clone(),
        new Vector3(0, 0, 0),
        500,
        (current) => {
          controls.target.copy(current);
          controls.update();
        },
        quinticEaseInOut
      ).then(() => {
        isCameraFocusing = false;
      });
    });
  };

  const getCameraOrbitPosition = (cameraPos: Vector3, systemPos: Vector3) => {
    const orbitDistance = 30;

    // Calculate the direction vector
    const directionVector = cameraPos
      .clone()
      .sub(systemPos)
      .normalize()
      .multiplyScalar(orbitDistance);

    // Calculate the new position
    const newCameraPosition = systemPos.clone().add(directionVector);
    return newCameraPosition;
  };

  const changeCameraFocus = async (
    target: Vector3,
    position: Vector3,
    onTarget?: () => void
  ) => {
    if (isCameraFocusing) return;
    isCameraFocusing = true;

    // Lerp from current camera target to new camera target
    await customLerp(
      controls.target.clone(),
      target,
      1000,
      (current) => {
        controls.target.copy(current);
        controls.update();
      },
      quinticEaseInOut
    ).then(async () => {
      if (onTarget) onTarget();

      // Lerp from current camera position to new camera position
      await customLerp(
        $camera.position.clone(),
        position,
        1500,
        (current) => {
          $camera.position.copy(current);
          controls.update();
        },
        quinticEaseInOut
      ).then(() => {
        isCameraFocusing = false;
      });
    });
  };

  onMount(() => {
    return () => {
      GalaxyStore.clear();
    };
  });

  const { camera } = useThrelte();

  let isCameraFocusing = false;
  let selectedSystemId: string | null = null;

  interactivity();
</script>

<T.PointLight
  position={[0, 0, 0]}
  intensity={2}
  distance={1000 * (selectedSystemId !== null ? 5 : 1)}
  decay={2}
/>
<T.AmbientLight intensity={0.75} />

<InstancedMesh
  id="selector"
  geometry={new SphereGeometry(1, 32, 32)}
  material={new MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  })}
>
  <InstancedMesh
    id="star"
    geometry={new SphereGeometry(1, 32, 32)}
    material={new MeshStandardMaterial()}
  >
    {#each [...$GalaxyStore.systems] as system (system[0])}
      <ArtistSystem
        isSelected={selectedSystemId === system[1].artist.id}
        isTopArtist={system[1].is_top_artist}
        color={system[1].color}
        artist={system[1].artist}
        position={system[1].position}
        planets={system[1].planets}
        clickCallback={() => {
          if (selectedSystemId !== system[1].artist.id && !isCameraFocusing) {
            const systemPosition = new Vector3(
              system[1].position[0],
              system[1].position[1],
              system[1].position[2]
            );
            changeCameraFocus(
              systemPosition,
              getCameraOrbitPosition($camera.position, systemPosition),
              () => {
                const selectSystem = () => {
                  selectedSystemId = system[1].artist.id;

                  // TODO: Check if system has enough planets
                  if (system[1].planets.size < 5) {
                    getArtistTracks(system[1].artist.id).then((tracks) => {
                      tracks.tracks.map((track) => {
                        GalaxyStore.addPlanet(
                          track,
                          false,
                          system[1].artist.id
                        );
                      });
                    });
                  }
                };

                if (selectedSystemId === null) {
                  GalaxyStore.expandPositions(system[1].artist.id, 250).then(
                    selectSystem
                  );
                } else {
                  selectSystem();
                }
              }
            );
          }
        }}
      />
    {/each}
  </InstancedMesh>
</InstancedMesh>
