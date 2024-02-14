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
  import simMorphFragment from "../components/helpers/shaders/simulation_morph.frag";
  import simCurlFragment from "../components/helpers/shaders/simulation_curl.frag";
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
    const width = 512;
    const height = 512;

    // populate a Float32Array of random positions
    var cubeData = getRandomCubeData(width, height, 2, true);
    var sphereData = getRandomSphereData(width, height, 2, true);

    //convertes it to a FloatTexture
    var cubeTexture = new THREE.DataTexture(
      cubeData,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    cubeTexture.needsUpdate = true;
    var sphereTexture = new THREE.DataTexture(
      sphereData,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    sphereTexture.needsUpdate = true;

    //simulation shader used to update the particles' positions
    var simulationShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: { value: sphereTexture },
        timer: { value: 0 },
        uTime: { value: 0 },
        curlFactor: { value: 0.5 },
        noiseScale: { value: 0.5 },
        noiseOffset: {
          value: new THREE.Vector3(noiseOffset, noiseOffset, noiseOffset),
        },
        pointSize: { value: 2 },
      },
      vertexShader: simVertex,
      fragmentShader: simCurlFragment,
    });

    //render shader to display the particles on screen
    //the 'positions' uniform will be set after the FBO.update() call
    var renderShader = new THREE.ShaderMaterial({
      uniforms: {
        positions: { value: null },
        pointSize: { value: 2 },
        big: { value: new THREE.Vector3(0.75, 0.5, 0.5) },
        small: { value: new THREE.Vector3(1, 0.5, 0) },
      },
      vertexShader: renderVertex,
      fragmentShader: renderFragment,
      transparent: true,
      // side: THREE.DoubleSide,
      // blending: THREE.AdditiveBlending,
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

    if (FBO) {
      // FBO.particles.position.set(
      //   Math.sin(elapsedTime),
      //   Math.cos(elapsedTime),
      //   0
      // );
      // FBO.particles.rotation.set(
      //   Math.sin(elapsedTime),
      //   Math.cos(elapsedTime),
      //   0
      // );

      //   FBO.simulationMaterial.uniforms.timer.value =
      //     (Math.sin(elapsedTime) + 1) / 2;
      FBO.simulationMaterial.uniforms.curlFactor.value = curlFactor;
      FBO.simulationMaterial.uniforms.noiseScale.value = noiseScale;
      FBO.simulationMaterial.uniforms.noiseOffset.value = new THREE.Vector3(
        elapsedTime * 0.5 + noiseOffset,
        elapsedTime * 0.5 + noiseOffset,
        elapsedTime * 0.5 + noiseOffset
      );
    }
    update(elapsedTime);
  });

  export let curlFactor = 0.4;
  export let noiseScale = 0.7;
  export let noiseOffset = 0;

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

  // For error or outdated browser
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

<T.PerspectiveCamera makeDefault position={[0, 0, 10]} />
<T.AmbientLight intensity={0.75} />
<T.DirectionalLight position={[0, 0, 20]} />

{#if loading_error !== null}
  <T.Mesh>
    <T.PlaneGeometry args={[size_x, size_y]} />
    <T.MeshStandardMaterial transparent opacity={0} />
  </T.Mesh>
  {#await createBackground() then}
    <BackgroundMesh />
  {/await}
{/if}
