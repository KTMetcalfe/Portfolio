<script lang="ts">
  import { T, useFrame } from '@threlte/core';
  import { Euler, MathUtils, Mesh, Vector3 } from 'three';
  import { SolStore } from '../../components/stores/SolStore';

  export let size: number;
  export let speed: number;
  export let rotation: number;

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

      const offset = planetRef.position.applyEuler(eu);

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
