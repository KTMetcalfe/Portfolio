<script lang="ts">
  import { T, useTask, useThrelte } from "@threlte/core";
  import { InstancedMesh, Instance } from "@threlte/extras";
  import { Color, Raycaster, Vector2, Vector3 } from "three";
  import { bgStore } from "../components/stores/BackgroundStore";
  import { onMount } from "svelte";

  const raycaster = new Raycaster();
  const mouse = new Vector2();
  let normalizedPosition = new Vector3();

  onMount(() => {
    document.getElementById("pageroot")?.addEventListener("mousemove", (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });
  });

  let elapsedTime = 0;
  const { scene, camera } = useThrelte();
  useTask((delta) => {
    elapsedTime += delta;
    raycaster.setFromCamera(mouse, $camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
      normalizedPosition = intersects[0].point;
    }

    // Update the z position of the background dots
    bgStore.update((state) => {
      state.forEach((dot) => {
        const distance = Math.sqrt(
          Math.pow(dot.x - normalizedPosition.x, 2) +
            Math.pow(dot.y - normalizedPosition.y, 2)
        );
        const radius = 2;
        const intensity = 2;

        if (distance < radius) {
          dot.z =
            Math.sin(elapsedTime + dot.x + dot.y + window.scrollY / 100) *
              0.25 -
            (intensity * (radius - distance)) / radius;
        } else {
          dot.z =
            Math.sin(elapsedTime + dot.x + dot.y + window.scrollY / 100) * 0.25;
        }
      });
      return state;
    });
  });
</script>

<InstancedMesh limit={5000} range={5000}>
  <T.MeshStandardMaterial />
  <T.CircleGeometry args={[0.02, 6]} />
  <!-- <Instance
    scale={0.05}
    position={normalizedPosition}
    color={new Color('#990000')}
  /> -->
  {#each [...$bgStore] as dot, i (i)}
    <Instance
      position={[dot.x, dot.y, dot.z]}
      color={dot.color ? new Color(dot.color) : "#333333"}
    />
  {/each}
</InstancedMesh>
