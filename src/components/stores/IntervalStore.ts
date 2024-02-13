import { readonly, writable } from 'svelte/store';

export const runOnInterval = (callback: Function, interval: number) => {
  const running = writable(false);

  let intervalId: number | undefined;

  const start = () => {
    intervalId = Number(
      setInterval(() => {
        callback();
      }, interval)
    );
    running.set(true);
  };

  const stop = () => {
    clearInterval(intervalId);
    intervalId = undefined;
    running.set(false);
  };

  const toggle = () => {
    running.update((started) => {
      if (started) {
        stop();
      } else {
        start();
      }
      return !started;
    });
  };

  return {
    started: readonly(running),
    start: start,
    stop: stop,
    toggle: toggle,
  };
};
