<script lang="ts">
  import { T, useTask } from "@threlte/core";
  import { Instance, InstancedMesh } from "@threlte/extras";
  import { generateGrid, type Grid, type Tower } from "./ConwayCanvas.svelte";

  let tower: Tower = [generateGrid(20, 20)];

  let elapsedFrames = 0;

  export let generations_per_second = 20;
  let generations = 0;

  const MAX_GENERATIONS = 50;

  const getGridHash = (grid: Grid) => {
    return grid.flat().join("");
  };

  const checkGameOver = (grid: Grid) => {
    const hash = getGridHash(grid);
    const lastHash = getGridHash(tower[tower.length - 1]);

    if (hash === lastHash) {
      return true;
    }

    if (tower.length < 3) {
      return false;
    }
    const secondLastHash = getGridHash(tower[tower.length - 2]);

    return hash === secondLastHash;
  };

  const resetGame = () => {
    tower = [generateGrid(20, 20)];
    elapsedFrames = 0;
    generations = 0;
  };

  const { start, stop, started, task } = useTask((delta) => {
    if (elapsedFrames % (60 / generations_per_second) === 0) {
      const newLevel = [];
      const lastLevel = tower[tower.length - 1];

      for (const rows in lastLevel) {
        const newRow = [];
        for (const cols in lastLevel[rows]) {
          const neighbors = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
          ];

          let aliveNeighbors = 0;
          for (const neighbor of neighbors) {
            const [dx, dy] = neighbor;
            const x = parseInt(cols) + dx;
            const y = parseInt(rows) + dy;

            if (
              x >= 0 &&
              x < lastLevel[0].length &&
              y >= 0 &&
              y < lastLevel.length
            ) {
              if (lastLevel[y][x]) {
                aliveNeighbors++;
              }
            }
          }

          if (lastLevel[rows][cols]) {
            newRow.push(aliveNeighbors === 2 || aliveNeighbors === 3);
          } else {
            newRow.push(aliveNeighbors === 3);
          }
        }
        newLevel.push(newRow);
      }

      if (checkGameOver(newLevel)) {
        stop();
        resetGame();
        start();
        return;
      }

      tower = [...tower, newLevel];

      generations++;
    }

    elapsedFrames++;
  });
</script>

<InstancedMesh limit={10000} range={10000}>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="white" />

  {#each tower as grid, y}
    {#if y > generations - MAX_GENERATIONS}
      {#each grid as row, z}
        {#each row as cell, x}
          {#if cell}
            <Instance
              color={`hsl(0, 10%, ${100 - ((generations - y) * 75) / MAX_GENERATIONS}%)`}
              position={[x, y - generations, z]}
            />
          {/if}
        {/each}
      {/each}
    {/if}
  {/each}
</InstancedMesh>
