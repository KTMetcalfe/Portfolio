<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { Euler, MathUtils, Mesh, Vector3 } from 'three';

  export let size: number;
  export let speed: number;
  export let rotation: number;
  export let selectedRef: Mesh | null;

  export let planetRef: Mesh;
  export let textLookAt: Vector3;

  // Updates object every frame
  useFrame(
    () => {
      const eu = new Euler(
        MathUtils.degToRad(0),
        MathUtils.degToRad(speed === 0 ? 0 : 360 / speed / 60),
        MathUtils.degToRad(0)
      );

      const offset = planetRef.position.clone().applyEuler(eu);
      planetRef.position.set(offset.x, offset.y, offset.z);

      if (
        selectedRef !== null &&
        selectedRef.geometry.boundingSphere !== null
      ) {
        const goodPos = new Vector3(
          selectedRef.position.x,
          selectedRef.position.y +
            2 * (selectedRef.geometry.boundingSphere?.radius || 1),
          selectedRef.position.z
        ).multiplyScalar(
          1 +
            5 *
              ((selectedRef.geometry.boundingSphere?.radius || 1) /
                selectedRef.position.distanceTo(new Vector3(0, 0, 0)))
        );
        textLookAt = goodPos;
      } else {
        textLookAt = new Vector3(0, offset.y + size * 2, 0);
      }

      planetRef.rotation.set(
        planetRef.rotation.x,
        (planetRef.rotation.y += MathUtils.degToRad(360 / rotation)),
        planetRef.rotation.z
      );
    },
    {
      autostart: true,
    }
  );
</script>
