<script lang="ts">
  import { Canvas } from "@threlte/core";
  import SolarSystem from "./SolarSystem.svelte";
  import { SolStore } from "../../components/stores/SolStore";
</script>

<!-- TODO: Add loading display -->
<div>
  <div
    class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
    role="application"
    on:contextmenu|preventDefault={() => {
      if ($SolStore.selected.name !== null && !$SolStore.selected.shouldLerp) {
        SolStore.deselect();
      }
    }}
  >
    <Canvas>
      <SolarSystem />
    </Canvas>
  </div>
  <div class="p-4 flex gap-2 fixed top-16">
    <select
      value={$SolStore.selected.name === null
        ? "default"
        : $SolStore.selected.name}
      on:change={(e) => {
        e.currentTarget.value === "default"
          ? SolStore.deselect()
          : SolStore.select(e.currentTarget.value, true);
      }}
    >
      <option disabled selected value={"default"}>Select a planet</option>
      <option value={"Mercury"}>Mercury</option>
      <option value={"Venus"}>Venus</option>
      <option value={"Earth"}>Earth</option>
      <option value={"Mars"}>Mars</option>
      <option value={"Jupiter"}>Jupiter</option>
      <option value={"Saturn"}>Saturn</option>
      <option value={"Uranus"}>Uranus</option>
      <option value={"Neptune"}>Neptune</option>
    </select>
    <button
      disabled={$SolStore.selected.name === null}
      on:click={() => SolStore.deselect()}>Deselect</button
    >
    <input
      type="range"
      min={1}
      max={1825}
      bind:value={$SolStore.secPerYear}
      step={1}
      list="steplist"
    />
    <datalist id="steplist">
      <option>1</option>
      <option>365</option>
      <option>730</option>
      <option>1095</option>
      <option>1460</option>
      <option>1825</option>
    </datalist>
    <p>
      {$SolStore.secPerYear === 31536000
        ? "(1 second = 1 second)"
        : $SolStore.secPerYear === 365
          ? "(1 second = 1 day)"
          : (365 / $SolStore.secPerYear).toFixed(2)}x
    </p>
    <button
      disabled={$SolStore.secPerYear === 31536000}
      on:click={() => ($SolStore.secPerYear = 31536000)}>Realtime</button
    >
  </div>
</div>
