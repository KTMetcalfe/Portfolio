<script lang="ts">
  import { Canvas, OrbitControls, T } from '@threlte/core';
  import { degToRad } from 'three/src/math/MathUtils';
  import Megacube from './Megacube.svelte';
  import { onMount } from 'svelte';
  import { CubeStore } from '../../components/stores/CubeStore';

  let size = 10;

  onMount(() => {
    // Empty the store on unmount
    return () => {
      CubeStore.clear();
    };
  });

  const createCube = () =>
    new Promise<void>((resolve) => {
      CubeStore.update((state) => {
        for (let i = -size / 2; i < size / 2; i++) {
          for (let j = -size / 2; j < size / 2; j++) {
            for (let k = -size / 2; k < size / 2; k++) {
              state.add({
                x: i,
                y: j,
                z: k,
                color:
                  '#' +
                  Math.floor(Math.random() * 0xffffff)
                    .toString(16)
                    .padStart(6, '0'),
              });
            }
          }
        }
        return state;
      });
      resolve();
    });
</script>

<div>
  {#await createCube()}
    <div class="w-full h-full flex justify-center items-center">
      <h1 class="text-2xl">Loading cube...</h1>
    </div>
  {:then}
    <Canvas>
      <T.PerspectiveCamera makeDefault fov={48} position={[20, 20, 20]}>
        <OrbitControls
          maxPolarAngle={degToRad(80)}
          enableZoom={false}
          target={{ y: 0.5 }}
        />
      </T.PerspectiveCamera>

      <T.DirectionalLight castShadow position={[3, 10, 10]} />
      <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
      <T.AmbientLight intensity={0.2} />

      <Megacube {size} />
    </Canvas>
  {/await}
</div>

<style>
  div {
    height: 100%;
    width: 100%;
  }
</style>
