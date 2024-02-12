<script lang="ts">
  import { Canvas, T } from '@threlte/core';
  import { bgStore } from '../components/stores/BackgroundStore';
  import { onMount } from 'svelte';
  import BackgroundMesh from './BackgroundMesh.svelte';

  onMount(() => {
    // Empty the store on unmount
    return () => {
      bgStore.clear();
    };
  });

  const size_x = 20;
  const size_y = 15;

  const createBackground = () =>
    new Promise<void>((resolve) => {
      const half_x = Math.floor(size_x / 2);
      const half_y = Math.floor(size_y / 2);

      bgStore.update((state) => {
        for (let i = -half_x; i < size_x / 2; i += 0.5) {
          for (let j = -half_y; j < size_y / 2; j += 0.5) {
            state.add({
              x: i,
              y: j,
              z: 0,
              color:
                '#' +
                Math.floor(Math.random() * 0xffffff)
                  .toString(16)
                  .padStart(6, '0'),
            });
          }
        }
        return state;
      });

      resolve();
    });
</script>

<div class="fixed -z-50 w-full h-full">
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[0, 0, 10]} />
    <T.DirectionalLight position={[0, 0, 20]} />

    <T.Mesh>
      <T.PlaneGeometry args={[size_x, size_y]} />
      <T.MeshStandardMaterial transparent opacity={0} />
    </T.Mesh>
    {#await createBackground() then}
      <BackgroundMesh />
    {/await}
  </Canvas>
</div>
