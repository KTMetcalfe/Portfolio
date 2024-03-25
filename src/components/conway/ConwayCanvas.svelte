<script lang="ts" context="module">
  export type Row = boolean[];
  export type Grid = Row[];
  export type Tower = Grid[];

  export const generateGrid = (rows: number, cols: number): Grid => {
    const grid: Grid = [];

    for (let i = 0; i < rows; i++) {
      const row: Row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Math.random() > 0.5);
      }
      grid.push(row);
    }

    return grid;
  };
</script>

<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  import { OrbitControls } from "@threlte/extras";
  import ConwayGame from "./ConwayGame.svelte";

  let controls: OrbitControls;
</script>

<div class="w-full h-[calc(100vh-4rem)] overflow-hidden">
  <Canvas>
    <T.PerspectiveCamera
      makeDefault
      position={[-25, 40, -25]}
      on:create={({ ref }) => {
        ref.lookAt(10, 0, 10);
      }}
    >
      <OrbitControls
        enableZoom={false}
        bind:ref={controls}
        autoRotate
        target={[10, 0, 10]}
      />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[-60, 50, 60]} intensity={0.5} />
    <T.AmbientLight intensity={0.5} />

    <ConwayGame />
  </Canvas>
</div>
