import type { Vector3 } from 'three';

export const customLerp = (
  start: Vector3,
  end: Vector3,
  time: number,
  onUpdate: (current: Vector3) => void,
  ease?: (t: number) => number
) =>
  new Promise<Vector3>((res) => {
    const lerpSteps = time >= 100 ? time / 5 : 20;

    let counter = 1;
    const interval = setInterval(() => {
      const t = ease ? ease(counter / lerpSteps) : counter / lerpSteps;
      const currentLerp = start.clone().lerp(end, t);

      onUpdate(currentLerp);

      if (counter >= lerpSteps) {
        clearInterval(interval);
        res(currentLerp);
      }
      counter++;
    }, time / lerpSteps);
  });

export const quinticEaseInOut = (t: number) => {
  if (t < 0.5) {
    return 16 * t * t * t * t * t;
  }
  t = t - 1;
  return 1 + 16 * t * t * t * t * t;
};
