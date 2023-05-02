<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { Clock, Euler, MathUtils, Mesh, Vector3 } from 'three';
  import { SolStore } from '../../components/stores/SolStore';
  import { onMount } from 'svelte';

  export let initialPosition: Vector3;
  export let size: number;
  export let speed: number;
  export let rotation: number;

  export let planetRef: Mesh;
  export let textLookAt: Vector3;

  const clock = new Clock();
  let currentRotationSpeed = 0;

  // Updates object every frame
  useFrame(
    () => {
      const elapsedTime = clock.getElapsedTime();
      currentRotationSpeed = speed === 0 ? 0 : 360 / speed / 60;
      const eu = new Euler(
        MathUtils.degToRad(0),
        MathUtils.degToRad(elapsedTime * currentRotationSpeed),
        MathUtils.degToRad(0)
      );

      const offset = initialPosition.applyEuler(eu);
      planetRef.position.copy(offset);

      if (
        $SolStore.selected.ref !== null &&
        $SolStore.selected.ref.geometry.boundingSphere !== null
      ) {
        const goodPos = new Vector3(
          $SolStore.selected.ref.position.x,
          $SolStore.selected.ref.position.y +
            2 * ($SolStore.selected.ref.geometry.boundingSphere?.radius || 1),
          $SolStore.selected.ref.position.z
        ).multiplyScalar(
          1 +
            5 *
              (($SolStore.selected.ref.geometry.boundingSphere?.radius || 1) /
                $SolStore.selected.ref.position.distanceTo(
                  new Vector3(0, 0, 0)
                ))
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
