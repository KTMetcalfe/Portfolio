<script lang="ts">
  import { Canvas, T } from "@threlte/core";
  import NewBackground from "./NewBackground.svelte";
  import DotBackground from "./DotBackground.svelte";

  let curlFactor = 0.45;
  let noiseScale = 0.35;
  let noiseOffset = 0;

  let showUtilities = false;

  let loading_error = false;
</script>

<div class="fixed -z-50 w-full h-full">
  <Canvas>
    <T.PerspectiveCamera makeDefault position={[0, 0, 10]} />
    <T.AmbientLight intensity={0.75} />
    <T.DirectionalLight position={[0, 0, 20]} />

    {#if !loading_error}
      <NewBackground
        {curlFactor}
        {noiseScale}
        {noiseOffset}
        onError={() => {
          loading_error = true;
        }}
        width={512}
        height={512}
      />
    {:else}
      <DotBackground />
    {/if}
  </Canvas>
</div>

{#if !loading_error && showUtilities}
  <div
    class="rounded-md bg-slate-700 p-4 absolute z-50 top-20 right-10 opacity-70"
  >
    <h1 class="text-4xl font-bold text-white">Utilities</h1>
    <div class="flex flex-col space-y-4 mt-4">
      <div class="flex flex-col space-y-2">
        <label for="curlFactor" class="text-white"
          >Curl Factor - {curlFactor}</label
        >
        <input
          type="range"
          id="curlFactor"
          min="0"
          max="1"
          step="0.01"
          bind:value={curlFactor}
        />
      </div>
      <div class="flex flex-col space-y-2">
        <label for="noiseScale" class="text-white"
          >Noise Scale - {noiseScale}</label
        >
        <input
          type="range"
          id="noiseScale"
          min="0"
          max="1"
          step="0.01"
          bind:value={noiseScale}
        />
      </div>
      <!-- <div class="flex flex-col space-y-2">
      <label for="noiseOffset" class="text-white"
        >Noise Offset - {noiseOffset}</label
      >
      <input
        type="range"
        id="noiseOffset"
        min="0"
        max="1"
        step="0.01"
        bind:value={noiseOffset}
      />
    </div> -->
    </div>
  </div>
{/if}
