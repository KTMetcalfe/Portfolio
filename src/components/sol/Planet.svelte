<script lang="ts">
  import { T } from "@threlte/core";
  import { Text, useTexture } from "@threlte/extras";
  import { SolStore } from "../stores/SolStore";
  import { Vector3 } from "three";

  import sunImg from "../../images/2k_sun.jpg?url";
  import mercuryImg from "../../images/2k_mercury.jpg?url";
  import venusImg from "../../images/2k_venus_atmosphere.jpg?url";
  import earthImg from "../../images/2k_earth_daymap.jpg?url";
  import marsImg from "../../images/2k_mars.jpg?url";
  import jupiterImg from "../../images/2k_jupiter.jpg?url";
  import saturnImg from "../../images/2k_saturn.jpg?url";
  import uranusImg from "../../images/2k_uranus.jpg?url";
  import neptuneImg from "../../images/2k_neptune.jpg?url";

  export let position: Vector3;
  export let size: number;
  export let rotation: Vector3;
  export let name: string;

  export let textLookAt: Vector3;

  // Chooses appropriate planet texture
  let texture: string | null = null;
  switch (name) {
    default:
      texture = sunImg;
      break;
    case "Mercury":
      texture = mercuryImg;
      break;
    case "Venus":
      texture = venusImg;
      break;
    case "Earth":
      texture = earthImg;
      break;
    case "Mars":
      texture = marsImg;
      break;
    case "Jupiter":
      texture = jupiterImg;
      break;
    case "Saturn":
      texture = saturnImg;
      break;
    case "Uranus":
      texture = uranusImg;
      break;
    case "Neptune":
      texture = neptuneImg;
      break;
  }
</script>

<T.Group position={[position.x, position.y, position.z]}>
  {#if name !== "Sun" && $SolStore.selected.name !== name}
    <Text
      text={name}
      anchorX="center"
      anchorY="bottom"
      position={[0, size + 2, 0]}
      scale={size * 10 + 15}
      lookAt={textLookAt}
      color="white"
    />
  {/if}
  {#if name === "Saturn"}
    <!-- TODO: Add rings -->
  {/if}
  <T.Mesh
    rotation={[rotation.x, rotation.y, rotation.z]}
    on:click={(e) => {
      e.stopPropagation();
      if ($SolStore.selected.name !== name && name !== "Sun") {
        SolStore.select(name, true);
      }
    }}
  >
    <T.SphereGeometry args={[size, 64, 64]} />
    {#if texture != null}
      {#await useTexture(texture) then map}
        <T.MeshStandardMaterial
          {map}
          emissive={name === "Sun" ? "red" : "black"}
          emissiveIntensity={0.05}
        />
      {/await}
    {:else}
      <T.MeshLambertMaterial color="pink" />
    {/if}
  </T.Mesh>
</T.Group>
