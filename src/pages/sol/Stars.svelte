<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { onMount } from 'svelte';
  import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    ShaderMaterial,
    Spherical,
    Vector3,
  } from 'three';

  // A lot of code taken from @react-three/drei Stars component
  // https://github.com/pmndrs/drei/blob/master/src/core/Stars.tsx

  export let radius: number = 100;
  export let depth: number = 50;
  export let count: number = 5000;
  export let factor: number = 4;
  export let saturation: number = 0;
  export let fade: boolean = false;
  export let speed: number = 1;

  class StarfieldMaterial extends ShaderMaterial {
    constructor() {
      super({
        uniforms: { time: { value: 0.0 }, fade: { value: 1.0 } },
        vertexShader: /* glsl */ `
          uniform float time;
          attribute float size;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
            gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
            gl_Position = projectionMatrix * mvPosition;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D pointTexture;
          uniform float fade;
          varying vec3 vColor;
          void main() {
            float opacity = 1.0;
            if (fade == 1.0) {
              float d = distance(gl_PointCoord, vec2(0.5, 0.5));
              opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
            }
            gl_FragColor = vec4(vColor, opacity);
            #include <tonemapping_fragment>
            #include <encodings_fragment>
          }`,
      });
    }
  }

  const genStar = (r: number) => {
    return new Vector3().setFromSpherical(
      new Spherical(
        r,
        Math.acos(1 - Math.random() * 2),
        Math.random() * 2 * Math.PI
      )
    );
  };

  const getData = () => {
    const positions = [];
    const colors = [];
    const sizes = Array.from(
      { length: count },
      () => (0.5 + 0.5 * Math.random()) * factor
    );
    const color = new Color();
    let r = radius + depth;
    const increment = depth / count;
    for (let i = 0; i < count; i++) {
      r -= increment * Math.random();
      positions.push(...genStar(r).toArray());
      color.setHSL(i / count, saturation, 0.9);
      colors.push(color.r, color.g, color.b);
    }
    return {
      position: new Float32Array(positions),
      color: new Float32Array(colors),
      size: new Float32Array(sizes),
    };
  };

  const { position, color, size } = getData();

  const material = new StarfieldMaterial();
  material.blending = AdditiveBlending;
  material.uniforms.fade.value = fade;
  material.depthWrite = false;
  material.transparent = true;
  material.vertexColors = true;

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(position, 3));
  geometry.setAttribute('color', new BufferAttribute(color, 3));
  geometry.setAttribute('size', new BufferAttribute(size, 1));

  let elapsedTime = 0;
  onMount(() => {
    useTask((delta) => {
      elapsedTime += delta;
      if (material) {
        material.uniforms.time.value = elapsedTime * speed;
      }
    });
  });
</script>

<T.Points {material} {geometry} />
