<script lang="ts">
  import * as THREE from "three";
  import {
    createFBO,
    getRandomCubeData,
    getRandomSphereData,
  } from "../components/helpers/FBO";

  import simVertex from "../components/helpers/shaders/simulation.vert";
  import simFragment from "../components/helpers/shaders/simulation.frag";
  import renderVertex from "../components/helpers/shaders/render.vert";
  import renderFragment from "../components/helpers/shaders/render.frag";
  import { useTask, useThrelte } from "@threlte/core";
  import { onMount } from "svelte";
  import { bgStore } from "../components/stores/BackgroundStore";
  import { T } from "@threlte/core";
  import BackgroundMesh from "./BackgroundMesh.svelte";
  import { OrbitControls } from "@threlte/extras";

  const { scene, camera, renderer } = useThrelte();

  //initializes the FBO particles object
  const init = () => {
    // width and height of FBO
    const width = 256;
    const height = 256;

    // populate a Float32Array of random positions
    var data = getRandomCubeData(width, height, 2);

    //convertes it to a FloatTexture
    var positions = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    positions.needsUpdate = true;

    //simulation shader used to update the particles' positions
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: { positions: { value: positions }, uTime: { value: 0 } },
      vertexShader: simVertex,
      fragmentShader: simFragment,
    });

    //render shader to display the particles on screen
    //the 'positions' uniform will be set after the FBO.update() call
    var renderShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: { value: null },
        pointSize: { value: 2 },
        uTime: { value: 0 },
      },
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
    });

    //init the FBO
    const FBO = createFBO(
      width,
      height,
      renderer,
      simulationShader,
      renderShader
    );
    scene.add(FBO.particles);

    FBO.update(0);

    return FBO;
  };

  let loading_error: string | null = null;
  let FBO: ReturnType<typeof createFBO> | null = null;

  const update = (time: number) => {
    if (FBO === null) return;
    FBO.update(time);
    renderer.render(scene, $camera);
  };

  let elapsedTime = 0;
  useTask((delta) => {
    elapsedTime += delta;
    FBO?.particles.position.set(
      Math.sin(elapsedTime),
      Math.cos(elapsedTime),
      0
    );
    FBO?.particles.rotation.set(
      Math.sin(elapsedTime),
      Math.cos(elapsedTime),
      0
    );
    update(elapsedTime);
  });

  // For error or outdated browser
  onMount(() => {
    try {
      FBO = init();
    } catch (error) {
      if (error instanceof Error) loading_error = error.message;
      console.error(error);
    }

    // Empty the store on unmount
    return () => {
      bgStore.clear();
      if (FBO) scene.remove(FBO.particles);
    };
  });

  const size_x = 16;
  const size_y = 10;

  function generatePastelColor() {
    const hue = Math.floor(Math.random() * 40);
    const saturation = 60 + Math.floor(Math.random() * 20);
    const lightness = 70 + Math.floor(Math.random() * 10);
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  const createBackground = () =>
    new Promise<void>((resolve) => {
      bgStore.update((state) => {
        for (let i = -size_x / 2; i <= size_x / 2; i += 0.25) {
          for (let j = -size_y / 2; j <= size_y / 2; j += 0.25) {
            state.add({
              x: i,
              y: j,
              z: 0,
              color: generatePastelColor(),
            });
          }
        }
        return state;
      });

      resolve();
    });
</script>

{#if loading_error === null}
  <T.PerspectiveCamera makeDefault position={[0, 0, 10]} />
  <T.AmbientLight intensity={0.75} />
{:else}
  <T.PerspectiveCamera makeDefault position={[0, 0, 10]} />
  <T.DirectionalLight position={[0, 0, 20]} />

  <T.Mesh>
    <T.PlaneGeometry args={[size_x, size_y]} />
    <T.MeshStandardMaterial transparent opacity={0} />
  </T.Mesh>
  {#await createBackground() then}
    <BackgroundMesh />
  {/await}
{/if}
