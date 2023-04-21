<script lang="ts">
  import { Instance, useFrame } from '@threlte/core';

  export let position: [number, number, number];

  useFrame(() => {
    const dist = Math.sqrt(
      position[0] ** 2 + position[1] ** 2 + position[2] ** 2
    );
    const rotChange = -2 / dist;

    const newX =
      position[0] * Math.cos(rotChange / dist) -
      position[2] * Math.sin(rotChange / dist);
    const newZ =
      position[0] * Math.sin(rotChange / dist) +
      position[2] * Math.cos(rotChange / dist);

    position[0] = newX;
    position[2] = newZ;
  });
</script>

<Instance position={{ x: position[0], y: position[1], z: position[2] }} />
