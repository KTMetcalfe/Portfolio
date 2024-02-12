<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  import { bgStore } from "../components/stores/BackgroundStore";
  import { onMount } from "svelte";
  import BackgroundMesh from "./BackgroundMesh.svelte";

  onMount(() => {
    // Empty the store on unmount
    return () => {
      bgStore.clear();
    };
  });

  const size_x = 16;
  const size_y = 10;

  function generatePastelColor() {
    const hue = Math.floor(Math.random() * 40);
    const saturation = 60 + Math.floor(Math.random() * 20);
    const lightness = 70 + Math.floor(Math.random() * 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  const createBackground = () =>
    new Promise<void>((resolve) => {
      bgStore.update((state) => {
        for (let i = -size_x / 2; i <= size_x / 2; i += 0.25) {
          for (let j = -size_y / 2; j <= size_y / 2; j += 0.25) {
            state.add({
              x: i,
              y: j,
              z: 0,
              color: generatePastelColor(),
            });
          }
        }
        console.log(state);
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
