<script lang="ts">
  import {
    Instance,
    InstancedMesh,
    T,
    useFrame,
    useThrelte,
  } from '@threlte/core';
  import {
    CircleGeometry,
    Color,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Raycaster,
    Vector2,
    Vector3,
  } from 'three';
  import { bgStore } from '../components/stores/BackgroundStore';
  import { onMount } from 'svelte';

  const raycaster = new Raycaster();
  const mouse = new Vector2();
  let normalizedPosition = new Vector3();

  const { camera } = useThrelte();

  onMount(() => {
    document.getElementById('pageroot')?.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  });

  const { start, stop, started } = useFrame(
    ({ clock, scene }) => {
      raycaster.setFromCamera(mouse, $camera);

      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        console.log(intersects[0].point);
        normalizedPosition = intersects[0].point;
      }

      // Update the z position of the background dots
      bgStore.update((state) => {
        state.forEach((dot) => {
          const distance = Math.sqrt(
            Math.pow(dot.x - normalizedPosition.x, 2) +
              Math.pow(dot.y - normalizedPosition.y, 2)
          );
          const radius = 2;
          const intensity = 2;

          if (distance < radius) {
            dot.z =
              Math.sin(clock.elapsedTime + dot.x + dot.y) * 0.25 -
              (intensity * (radius - distance)) / radius;
          } else {
            dot.z = Math.sin(clock.elapsedTime + dot.x + dot.y) * 0.25;
          }
        });
        return state;
      });
    },
    {
      autostart: true,
    }
  );
</script>

<InstancedMesh
  material={new MeshBasicMaterial()}
  geometry={new CircleGeometry(0.02, 6)}
>
  <!-- <Instance
    scale={0.05}
    position={normalizedPosition}
    color={new Color('#990000')}
  /> -->
  {#each [...$bgStore] as dot, i (i)}
    <Instance
      position={{
        x: dot.x,
        y: dot.y,
        z: dot.z,
      }}
      color={dot.color
        ? new Color(`#${dot.color.replace('#', '')}`)
        : '#333333'}
    />
  {/each}
</InstancedMesh>
