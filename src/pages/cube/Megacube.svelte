<script lang="ts">
  // TODO: Smooth movement of cube shrinking "snake"
  import { T, useTask } from "@threlte/core";
  import Cube from "./Cube.svelte";
  import { CubeStore } from "../../components/stores/CubeStore";
  import { BoxGeometry, MeshStandardMaterial } from "three";
  import { InstancedMesh, interactivity } from "@threlte/extras";

  export let size: number;

  let selectedPosition = {
    posX: size / 2 - 1,
    posY: size / 2 - 1,
    posZ: size / 2 - 1,
  };

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

  const { started } = useTask(() => {
    if (selectedPosition) {
      const neighbors = getValidNeighbors(
        Math.floor(selectedPosition.posX),
        Math.floor(selectedPosition.posY),
        Math.floor(selectedPosition.posZ)
      );
      if (neighbors.length > 0) {
        const neighbor =
          neighbors[Math.floor(Math.random() * neighbors.length)];
        selectedPosition = {
          posX: neighbor.x,
          posY: neighbor.y,
          posZ: neighbor.z,
        };
      }
    }
    rotAmount = rotAmount === 360 ? 0 : rotAmount + 0.005;
  });

  interactivity();
</script>

<InstancedMesh
  id="selector"
  material={new MeshStandardMaterial({
    transparent: true,
    opacity: 0,
  })}
  geometry={new BoxGeometry()}
>
  <InstancedMesh
    id="cube"
    material={new MeshStandardMaterial()}
    geometry={new BoxGeometry()}
    castShadow
  >
    <T.Group rotation={[rotAmount, rotAmount, rotAmount]}>
      {#each [...$CubeStore] as cube (cube.x + "," + cube.y + "," + cube.z)}
        <Cube
          color={cube.color}
          posSelected={$started ? selectedPosition : undefined}
          posX={cube.x}
          posY={cube.y}
          posZ={cube.z}
        />
      {/each}
    </T.Group>
  </InstancedMesh>
</InstancedMesh>
