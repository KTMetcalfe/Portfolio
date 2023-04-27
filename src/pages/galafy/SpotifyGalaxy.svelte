<script lang="ts">
  import {
    getTopArtists,
    getRelatedArtists,
    getTopTracks,
  } from '../../components/helpers/spotify';
  import { Canvas, OrbitControls, T } from '@threlte/core';
  import ArtistSystem from './ArtistSystem.svelte';
  import { onMount } from 'svelte';
  import { GalaxyStore } from '../../components/stores/GalaxyStore';
  import { PerspectiveCamera, Vector3 } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';

  const createArtistSystems = async () => {
    const topArtists = await getTopArtists();
    await Promise.all(
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist);

        const relatedArtists = await getRelatedArtists(artist.id);
        relatedArtists.artists = relatedArtists.artists.filter(
          (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
        );
        // Change amount of related artists to add here
        relatedArtists.artists.slice(0, 20).map((relatedArtist) => {
          GalaxyStore.addSystem(relatedArtist);
        });
      })
    );

    const topTracks = await getTopTracks();
    topTracks.items.map((track) => {
      const artist = track.artists[0];
      if (GalaxyStore.containsSystem(artist.id)) {
        GalaxyStore.addPlanet(track);
      }
    });
  };

  const getCameraOrbitPosition = (cameraPos: Vector3, systemPos: Vector3) => {
    // Calculate the direction vector
    const directionVector = cameraPos
      .clone()
      .sub(systemPos)
      .normalize()
      .multiplyScalar(10);

    // Calculate the new position
    const newCameraPosition = systemPos.clone().add(directionVector);
    return newCameraPosition;
  };

  const customLerp = (
    start: Vector3,
    end: Vector3,
    time: number,
    onUpdate: (current: Vector3) => void,
    ease?: (t: number) => number
  ) =>
    new Promise<Vector3>((res) => {
      const lerpSteps = time >= 100 ? time / 5 : 20;

      let counter = 1;
      const interval = setInterval(() => {
        const t = ease ? ease(counter / lerpSteps) : counter / lerpSteps;
        const currentLerp = start.clone().lerp(end, t);

        onUpdate(currentLerp);

        if (counter >= lerpSteps) {
          clearInterval(interval);
          res(currentLerp);
        }
        counter++;
      }, time / lerpSteps);
    });

  const changeCameraFocus = (
    target: Vector3,
    position: Vector3,
    invertAnimation?: boolean
  ) => {
    if (isCameraFocusing) return;
    isCameraFocusing = true;

    const quinticEaseInOut = (t: number) => {
      if (t < 0.5) {
        return 16 * t * t * t * t * t;
      }
      t = t - 1;
      return 1 + 16 * t * t * t * t * t;
    };

    if (invertAnimation) {
      // Lerp from current camera target to new camera target
      customLerp(
        cameraRef.position.clone(),
        position,
        750,
        (current) => {
          cameraRef.position.copy(current);
          controlsRef.update();
        },
        quinticEaseInOut
      ).then(() => {
        // Lerp from current camera position to new camera position
        customLerp(
          controlsRef.target.clone(),
          target,
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
    } else {
      customLerp(
        controlsRef.target.clone(),
        target,
        1000,
        (current) => {
          controlsRef.target.set(current.x, current.y, current.z);
          controlsRef.update();
        },
        quinticEaseInOut
      ).then(() => {
        customLerp(
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
    }
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
  class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
  on:contextmenu|preventDefault={() =>
    changeCameraFocus(new Vector3(0, 0, 0), new Vector3(750, 750, 0), true)}
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

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    {#each [...$GalaxyStore.systems] as system, i (system[0])}
      <ArtistSystem
        isSelected={selectedSystemId === system[1].artist.id}
        color={system[1].color}
        artist={system[1].artist}
        position={system[1].position}
        planets={system[1].planets}
        clickCallback={() => {
          console.log(system);
          if (selectedSystemId !== system[1].artist.id && !isCameraFocusing) {
            selectedSystemId = system[1].artist.id;
            const systemPosition = new Vector3(
              system[1].position[0],
              system[1].position[1],
              system[1].position[2]
            );
            changeCameraFocus(
              systemPosition,
              getCameraOrbitPosition(cameraRef.position, systemPosition)
            );
          }
        }}
      />
    {/each}
  </Canvas>
</div>
