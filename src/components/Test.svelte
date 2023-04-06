<script lang="ts">
  // TODO: Smooth movement of cube shrinking "snake"
  import { Canvas, OrbitControls, T } from '@threlte/core';
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { degToRad } from 'three/src/math/MathUtils';
  import Cube from './Cube.svelte';
  import { CubeStore } from './stores/CubeStore';
  import { runOnInterval } from './stores/IntervalStore';

  let size = 10;

  onMount(() => {
    for (let i = -size / 2; i < size / 2; i++) {
      for (let j = -size / 2; j < size / 2; j++) {
        for (let k = -size / 2; k < size / 2; k++) {
          CubeStore.add(
            i,
            j,
            k,
            // Color outer edges
            // i === size / 2 - 1 ||
            // 	i === -size / 2 ||
            // 	j === size / 2 - 1 ||
            // 	j === -size / 2 ||
            // 	k === size / 2 - 1 ||
            // 	k === -size / 2
            // 	? '#333333'
            // 	:
            '#' +
              Math.floor(Math.random() * 0xffffff)
                .toString(16)
                .padStart(6, '0')
          );
        }
      }
    }

    // Empty the store on unmount

    return () => {
      CubeStore.clear();
    };
  });

  const selectedPosition = tweened(
    { posX: size / 2 - 1, posY: size / 2 - 1, posZ: size / 2 - 1 },
    {
      duration: 10,
    }
  );

  const isOnEdge = (posX: number, posY: number, posZ: number) => {
    return (
      posX === -size / 2 ||
      posX === size / 2 - 1 ||
      posY === -size / 2 ||
      posY === size / 2 - 1 ||
      posZ === -size / 2 ||
      posZ === size / 2 - 1
    );
  };

  const isWithinBounds = (posX: number, posY: number, posZ: number) => {
    return (
      posX < size / 2 &&
      posX >= -size / 2 &&
      posY < size / 2 &&
      posY >= -size / 2 &&
      posZ < size / 2 &&
      posZ >= -size / 2
    );
  };

  const getValidNeighbors = (posX: number, posY: number, posZ: number) => {
    const neighbors = [
      { x: posX + 1, y: posY, z: posZ },
      { x: posX - 1, y: posY, z: posZ },
      { x: posX, y: posY + 1, z: posZ },
      { x: posX, y: posY - 1, z: posZ },
      { x: posX, y: posY, z: posZ + 1 },
      { x: posX, y: posY, z: posZ - 1 },
    ];

    return neighbors.filter(
      (n) => isOnEdge(n.x, n.y, n.z) && isWithinBounds(n.x, n.y, n.z)
    );
  };

  let rotAmount = 0;

  const { started, start, stop, toggle } = runOnInterval(() => {
    if (selectedPosition) {
      const neighbors = getValidNeighbors(
        Math.floor($selectedPosition.posX),
        Math.floor($selectedPosition.posY),
        Math.floor($selectedPosition.posZ)
      );
      if (neighbors.length > 0) {
        const neighbor =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        $selectedPosition = {
          posX: neighbor.x,
          posY: neighbor.y,
          posZ: neighbor.z,
        };
      }
    }
    rotAmount = rotAmount === 360 ? 0 : rotAmount + 0.01;
  }, 10);

  start();
</script>

<div>
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[20, 20, 20]} fov={48}>
      <OrbitControls
        maxPolarAngle={degToRad(80)}
        enableZoom={true}
        target={{ y: 0.5 }}
      />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    <T.Group rotation={[rotAmount, rotAmount, rotAmount]}>
      {#each [...$CubeStore] as cube, i (cube.x + ',' + cube.y + ',' + cube.z)}
        <Cube
          color={cube.color}
          posSelected={$started ? $selectedPosition : undefined}
          posX={cube.x}
          posY={cube.y}
          posZ={cube.z}
        />
      {/each}
    </T.Group>
  </Canvas>
</div>

<style>
  div {
    height: 100%;
    width: 100%;
  }
</style>
