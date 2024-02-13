<script lang="ts">
  import { T } from "@threlte/core";
  import { spring } from "svelte/motion";
  import { Color, Vector2 } from "three";
  import { CubeStore } from "../../components/stores/CubeStore";
  import { Instance } from "@threlte/extras";

  export let posX: number;
  export let posY: number;
  export let posZ: number;
  export let color = "#333333";
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
  <Instance
    id="selector"
    scale={1}
    on:pointerenter={(e) => {
      e.stopPropagation();
      tmpColor = "#ffffff";
    }}
    on:pointerleave={(e) => {
      e.stopPropagation();
      tmpColor = color;
    }}
    on:click={(e) => {
      e.stopPropagation();
      CubeStore.remove(posX, posY, posZ);
    }}
  />
  <Instance
    id="cube"
    scale={$scale}
    color={new Color(`#${tmpColor.replace("#", "")}`)}
  />
</T.Group>
