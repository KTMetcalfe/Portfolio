import type { WebGLRenderer } from "three";
import * as THREE from "three";

export const createFBO = (
  width: number,
  height: number,
  renderer: WebGLRenderer,
  simulationMaterial: THREE.ShaderMaterial,
  renderMaterial: THREE.ShaderMaterial
) => {
  const gl = renderer.getContext();

  checkHardware(gl);
  const { scene, orthoCamera, rtt } = createTarget(width, height);
  const { mesh } = createSimulation(scene, simulationMaterial);
  const { particles } = createParticles(width, height, renderMaterial);

  //7 update loop
  const update = (time: number) => {
    // Update the simulation and render the result to a target texture
    renderer.setRenderTarget(rtt);
    renderer.clear();
    renderer.render(scene, orthoCamera);
    renderer.setRenderTarget(null);

    // Use the result of the swap as the new position for the particles' renderer
    particles.material.uniforms.positions.value = rtt.texture;

    simulationMaterial.uniforms.uTime.value = time;
  };

  return { update, particles, simulationMaterial };
};

const checkHardware = (gl: WebGLRenderingContext | WebGL2RenderingContext) => {
  //1 we need FLOAT Textures to store positions
  //https://github.com/KhronosGroup/WebGL/blob/master/sdk/tests/conformance/extensions/oes-texture-float.html
  // if (!gl.getExtension("OES_texture_float")) {
  //   throw new Error("float textures not supported");
  // }

  //2 we need to access textures from within the vertex shader
  //https://github.com/KhronosGroup/WebGL/blob/90ceaac0c4546b1aad634a6a5c4d2dfae9f4d124/conformance-suites/1.0.0/extra/webgl-info.html
  if (gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0) {
    throw new Error("vertex shader cannot read textures");
  }
};

const createTarget = (width: number, height: number) => {
  //3 rtt setup
  const scene = new THREE.Scene();
  const orthoCamera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    1 / Math.pow(2, 53),
    1
  );

  //4 create a target texture
  const options = {
    minFilter: THREE.NearestFilter, //important as we want to sample square pixels
    magFilter: THREE.NearestFilter, //
    format: THREE.RGBAFormat, //was RGBFormat
    type: THREE.FloatType, //important as we need precise coordinates (not ints)
  };
  const rtt = new THREE.WebGLRenderTarget(width, height, options);

  return { scene, orthoCamera, rtt };
};

const createSimulation = (
  scene: THREE.Scene,
  simulationMaterial: THREE.ShaderMaterial
) => {
  //5 the simulation:
  //create a bi-unit quadrilateral and uses the simulation material to update the Float Texture
  var geom = new THREE.BufferGeometry();
  geom.setAttribute(
    "position",
    new THREE.BufferAttribute(
      new Float32Array([
        -1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0,
      ]),
      3
    )
  );
  geom.setAttribute(
    "uv",
    new THREE.BufferAttribute(
      new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]),
      2
    )
  );
  const mesh = new THREE.Mesh(geom, simulationMaterial);
  scene.add(mesh);

  return { mesh };
};

const createParticles = (
  width: number,
  height: number,
  renderMaterial: THREE.ShaderMaterial
) => {
  //6 the particles:
  //create a vertex buffer of size width * height with normalized coordinates
  var l = width * height;
  var vertices = new Float32Array(l * 3);
  for (var i = 0; i < l; i++) {
    var i3 = i * 3;
    vertices[i3] = (i % width) / width;
    vertices[i3 + 1] = i / width / height;
  }

  //create the particles geometry
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  //the rendermaterial is used to render the particles
  const particles = new THREE.Points(geometry, renderMaterial);
  return {
    particles,
  };
};

// Randomly positions points on a sphere
const getRandomSpherePoint = (surfaceOnly = false) => {
  const u = Math.random();
  const v = Math.random();

  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);
  const r = surfaceOnly ? 1 : Math.cbrt(Math.random());

  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  const vector = new THREE.Vector3();

  vector.x = r * sinPhi * cosTheta;
  vector.y = r * sinPhi * sinTheta;
  vector.z = r * cosPhi;

  return vector;
};

export const getRandomSphereData = (
  width: number,
  height: number,
  size: number,
  surfaceOnly = false
) => {
  // Populate a Float32Array of random positions
  let length = width * height * 4;
  let data = new Float32Array(length);
  for (let i = 0; i < length; i += 4) {
    // Random positions inside a sphere
    const point = getRandomSpherePoint(surfaceOnly);
    data[i + 0] = point.x * size;
    data[i + 1] = point.y * size;
    data[i + 2] = point.z * size;
    data[i + 3] = 1;
  }

  return data;
};

export const getRandomCubeData = (
  width: number,
  height: number,
  size: number,
  surfaceOnly = false
) => {
  var length = width * height * 4;
  var data = new Float32Array(length);
  for (var i = 0; i < length; i += 4) {
    if (surfaceOnly) {
      const fixedDimension = Math.floor(Math.random() * 3);
      const fixedValue = Math.random() < 0.5 ? -1 : 1;

      // Randomly generate the other two dimensions
      data[i + fixedDimension] = fixedValue; // Set one dimension to its max/min
      data[i + ((fixedDimension + 1) % 3)] = (Math.random() - 0.5) * size; // Other dimensions
      data[i + ((fixedDimension + 2) % 3)] = (Math.random() - 0.5) * size; // Other dimensions
      data[i + 3] = 1;
    } else {
      data[i + 0] = (Math.random() - 0.5) * size;
      data[i + 1] = (Math.random() - 0.5) * size;
      data[i + 2] = (Math.random() - 0.5) * size;
      data[i + 3] = 1;
    }
  }
  return data;
};
