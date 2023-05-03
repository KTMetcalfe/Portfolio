<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { MathUtils, Vector3 } from 'three';

  export let radius: number = 1000;
  export let depth: number = 50;
  export let count: number = 5000;
  export let factor: number = 2;

  export let saturation: number = 0;
  export let fade: boolean = true;
  export let speed: number = 1;

  const stars: Array<{
    position: Vector3;
    scale: number;
  }> = [];

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);

    const dist = MathUtils.randFloat(radius - depth / 2, radius + depth / 2);
    const pos = new Vector3(0, 0, 0).add(
      new Vector3(x, y, z).multiplyScalar(dist)
    );

    const scale = MathUtils.randFloat(1, factor);
    stars.push({ position: pos, scale });
  }

  let scale = 1;
  useFrame((ctx) => {
    if (fade) {
      scale = Math.sin(ctx.clock.getElapsedTime() * speed) * 0.25 + 1;
    }
  });
</script>

{#each stars as star}
  <T.Sprite
    position={[star.position.x, star.position.y, star.position.z]}
    scale={star.scale * scale}
  >
    <T.SpriteMaterial transparent opacity={0.75 + saturation} />
  </T.Sprite>
{/each}
