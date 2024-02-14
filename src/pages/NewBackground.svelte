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

  export let width = 512;
  export let height = 512;

  export let curlFactor = 0.4;
  export let noiseScale = 0.7;
  export let noiseOffset = 0;

  export let onError: (error: unknown) => void = () => {};

  const { scene, camera, renderer } = useThrelte();

  let FBO: ReturnType<typeof createFBO> | null = null;

  onMount(() => {
    try {
      FBO = init();
    } catch (error) {
      console.error(error);
      onError(error);
    }
  });

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

      // FBO.simulationMaterial.uniforms.timer.value =
      //   (Math.sin(elapsedTime) + 1) / 2;
      // FBO.simulationMaterial.uniforms.curlFactor.value =
      //   (-Math.sin(elapsedTime) + 1) / 4;

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

  //initializes the FBO particles object
  const init = () => {
    // populate a Float32Array of random positions
    var cubeData = getRandomCubeData(width, height, 3, true);
    var sphereData = getRandomSphereData(width, height, 3, true);

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
        // textureB: { value: cubeTexture },
        timer: { value: 0 },
        uTime: { value: 0 },
        curlFactor: { value: curlFactor },
        noiseScale: { value: noiseScale },
        noiseOffset: {
          value: new THREE.Vector3(noiseOffset, noiseOffset, noiseOffset),
        },
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

  const update = (time: number) => {
    if (FBO === null) return;
    FBO.update(time);
    renderer.render(scene, $camera);
  };
</script>
