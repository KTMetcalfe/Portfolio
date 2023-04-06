<script lang="ts">
  import { InteractiveObject, T, Three } from '@threlte/core';
  import { spring } from 'svelte/motion';
  import { CubeStore } from './stores/CubeStore';
  import { Color } from 'three';

  export let posX: number;
  export let posY: number;
  export let posZ: number;
  export let color = '#333333';
  export let posSelected:
    | { posX: number; posY: number; posZ: number }
    | undefined = undefined;

  const getNewScale = (position: typeof posSelected) => {
    if (position) {
      const isCurrentCube =
        position.posX === posX &&
        position.posY === posY &&
        position.posZ === posZ;

      if (isCurrentCube) {
        // Scale for selected cube
        return 0;
      }

      // Distance from selected cube
      const distance = Math.sqrt(
        Math.pow(position.posX - posX, 2) +
          Math.pow(position.posY - posY, 2) +
          Math.pow(position.posZ - posZ, 2)
      );

      // Scale for cubes that are not selected
      return distance < 3 ? distance / 3 : 1;
    }

    // Default scale
    return 1;
  };

  const scale = spring(getNewScale(posSelected), {
    stiffness: 0.05,
    damping: 0.1,
  });
  $: $scale = getNewScale(posSelected);

  let tmpColor = color;
</script>

<T.Group position.x={posX} position.y={posY} position.z={posZ}>
  <T.Mesh scale={1} let:ref>
    <InteractiveObject
      object={ref}
      interactive
      on:pointerenter={() => {
        tmpColor = '#666666';
      }}
      on:pointerleave={() => {
        tmpColor = color;
      }}
      on:pointerdown={() => {
        CubeStore.remove(posX, posY, posZ);
      }}
    />
    <T.BoxGeometry />
    <T.MeshStandardMaterial opacity={0} transparent />
  </T.Mesh>
  <T.Mesh scale={$scale} castShadow>
    <T.BoxGeometry />
    <!-- Dumb way to get around color typing -->
    <T.MeshStandardMaterial
      color={new Color(`#${tmpColor.replace('#', '')}`)}
    />
  </T.Mesh>
</T.Group>
