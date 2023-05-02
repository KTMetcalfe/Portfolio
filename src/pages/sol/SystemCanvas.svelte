<script lang="ts">
  import { Canvas } from '@threlte/core';
  import type { Mesh } from 'three';
  import SolarSystem from './SolarSystem.svelte';

  let secPerYear = 365;
  let selectedRef: Mesh | null = null;
  let shouldLerp = false;
  let selectedName = '';

  const clearSelection = () => {
    selectedName = '';
    selectedRef = null;
    shouldLerp = true;
  };
</script>

<div>
  <div
    class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
    on:contextmenu|preventDefault={() => {
      if (selectedRef !== null && !shouldLerp) {
        clearSelection();
      }
    }}
  >
    <Canvas>
      <SolarSystem
        bind:shouldLerp
        bind:selectedRef
        {secPerYear}
        {selectedName}
      />
    </Canvas>
  </div>
  <div class="p-4 flex gap-2 fixed top-16">
    <!-- <select className='overlayText' value={state.selectedRef === null ? 'default' : state.selectedRef?.current.name} onSelect={e => {}}>
          <option disabled selected value={'default'}>Select a planet</option>
          <option value={"Mercury"}>Mercury</option>
          <option value={"Venus"}>Venus</option>
          <option value={"Earth"}>Earth</option>
          <option value={"Mars"}>Mars</option>
          <option value={"Jupiter"}>Jupiter</option>
          <option value={"Saturn"}>Saturn</option>
          <option value={"Uranus"}>Uranus</option>
          <option value={"Neptune"}>Neptune</option>
        </select> -->
    <button disabled={shouldLerp} on:click={() => clearSelection()}
      >Deselect</button
    >
    <input
      type="range"
      min={1}
      max={1825}
      value={secPerYear}
      step={1}
      list="steplist"
      on:input={(e) => {
        secPerYear = Number(e.currentTarget.value);
      }}
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
      {secPerYear === 31536000
        ? '(1 second = 1 second)'
        : secPerYear === 365
        ? '(1 second = 1 day)'
        : (365 / secPerYear).toFixed(2)}x
    </p>
    <button
      disabled={secPerYear === 31536000}
      on:click={() => (secPerYear = 31536000)}>Realtime</button
    >
  </div>
</div>
