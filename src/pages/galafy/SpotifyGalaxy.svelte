<script lang="ts">
  import {
    getTopArtists,
    getRelatedArtists,
    getTopTracks,
    getArtistTracks,
  } from '../../components/helpers/spotify';
  import { Canvas, InstancedMesh, OrbitControls, T } from '@threlte/core';
  import ArtistSystem from './ArtistSystem.svelte';
  import { onMount } from 'svelte';
  import { GalaxyStore } from '../../components/stores/GalaxyStore';
  import {
    Color,
    MeshStandardMaterial,
    PerspectiveCamera,
    SphereGeometry,
    Vector3,
  } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';
  import {
    customLerp,
    quinticEaseInOut,
  } from '../../components/helpers/animation';

  const createArtistSystems = async () => {
    const topArtists = await getTopArtists();
    await Promise.all(
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist, true);

        const relatedArtists = await getRelatedArtists(artist.id);
        relatedArtists.artists = relatedArtists.artists.filter(
          (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
        );
        // Change amount of related artists to add here
        relatedArtists.artists.slice(0, 20).map((relatedArtist) => {
          GalaxyStore.addSystem(relatedArtist, false);
        });
      })
    );

    const topTracks = await getTopTracks();
    topTracks.items.map((track) => {
      const artist = track.artists[0];
      if (GalaxyStore.containsSystem(artist.id)) {
        GalaxyStore.addPlanet(track, true);
      }
    });
  };

  const resetCameraFocus = async (onPosition?: () => void) => {
    if (isCameraFocusing) return;
    isCameraFocusing = true;

    await customLerp(
      cameraRef.position.clone(),
      new Vector3(750, 750, 0),
      750,
      (current) => {
        cameraRef.position.copy(current);
        controlsRef.update();
      },
      quinticEaseInOut
    ).then(async () => {
      if (onPosition) onPosition();

      await customLerp(
        controlsRef.target.clone(),
        new Vector3(0, 0, 0),
        500,
        (current) => {
          controlsRef.target.set(current.x, current.y, current.z);
          controlsRef.update();
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
      controlsRef.target.clone(),
      target,
      1000,
      (current) => {
        controlsRef.target.set(current.x, current.y, current.z);
        controlsRef.update();
      },
      quinticEaseInOut
    ).then(async () => {
      if (onTarget) onTarget();

      // Lerp from current camera position to new camera position
      await customLerp(
        cameraRef.position.clone(),
        position,
        1500,
        (current) => {
          cameraRef.position.copy(current);
          controlsRef.update();
        },
        quinticEaseInOut
      ).then(() => {
        isCameraFocusing = false;
      });
    });
  };

  onMount(() => {
    createArtistSystems();
    return () => {
      GalaxyStore.clear();
    };
  });

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControlsType;

  let isCameraFocusing = false;
  let selectedSystemId: string | null = null;
</script>

<div
  class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-slate-950"
  on:contextmenu|preventDefault={() => {
    resetCameraFocus(() => {
      selectedSystemId = null;
      GalaxyStore.resetPositions(200);
    });
  }}
>
  <Canvas>
    <T.PerspectiveCamera
      bind:ref={cameraRef}
      makeDefault
      fov={72}
      position={[750, 750, 0]}
    >
      <OrbitControls
        bind:controls={controlsRef}
        enablePan={false}
        target={{
          x: 0,
          y: 0,
          z: 0,
        }}
      />
    </T.PerspectiveCamera>

    <T.PointLight
      position={[0, 0, 0]}
      intensity={1}
      distance={1000 * (selectedSystemId !== null ? 5 : 1)}
      decay={2}
    />
    <T.AmbientLight intensity={0.2} />

    <InstancedMesh
      id="star"
      interactive
      geometry={new SphereGeometry(1, 32, 32)}
      material={new MeshStandardMaterial()}
    >
      <InstancedMesh
        id="planet"
        geometry={new SphereGeometry(1, 32, 32)}
        material={new MeshStandardMaterial()}
      >
        {#each [...$GalaxyStore.systems] as system, i (system[0])}
          <ArtistSystem
            isSelected={selectedSystemId === system[1].artist.id}
            isTopArtist={system[1].is_top_artist}
            color={system[1].color}
            artist={system[1].artist}
            position={system[1].position}
            planets={system[1].planets}
            clickCallback={() => {
              if (
                selectedSystemId !== system[1].artist.id &&
                !isCameraFocusing
              ) {
                const systemPosition = new Vector3(
                  system[1].position[0],
                  system[1].position[1],
                  system[1].position[2]
                );
                changeCameraFocus(
                  systemPosition,
                  getCameraOrbitPosition(cameraRef.position, systemPosition),
                  () => {
                    const selectSystem = () => {
                      selectedSystemId = system[1].artist.id;

                      if (system[1].planets.size === 0) {
                        getArtistTracks(system[1].artist.id).then((tracks) => {
                          tracks.tracks.map((track) => {
                            GalaxyStore.addPlanet(track, false);
                          });
                        });
                      }
                    };

                    if (selectedSystemId === null) {
                      GalaxyStore.expandPositions(
                        system[1].artist.id,
                        250
                      ).then(selectSystem);
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
  </Canvas>
</div>
