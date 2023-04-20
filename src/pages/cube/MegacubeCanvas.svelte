<script lang="ts">
  import { Canvas, OrbitControls, T } from '@threlte/core';
  import { degToRad } from 'three/src/math/MathUtils';
  import Megacube from './Megacube.svelte';
  import type { PerspectiveCamera } from 'three';

  let cameraRef: PerspectiveCamera | undefined = undefined;
</script>

<div>
  <Canvas>
    <T.PerspectiveCamera ref={cameraRef} makeDefault fov={48} position={[20, 20, 20]}>
      <OrbitControls
        maxPolarAngle={degToRad(80)}
        enableZoom={false}
        target={{ y: 0.5 }}
      />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    <Megacube />
  </Canvas>
</div>

<style>
  div {
    height: 100%;
    width: 100%;
  }
</style>
