import { writable } from 'svelte/store';
import type { Mesh } from 'three';

const createSolStore = () => {
  const { subscribe, set, update } = writable<{
    selected: {
      name: string | null;
      ref: Mesh | null;
      shouldLerp: boolean;
    };
    secPerYear: number;
  }>({
    selected: { name: null, ref: null, shouldLerp: false },
    secPerYear: 365,
  });

  return {
    subscribe,
    set,
    update,
    select: (name: string, ref: Mesh, shouldLerp: boolean) => {
      update((state) => {
        return { ...state, selected: { name, ref, shouldLerp } };
      });
    },
    deselect: () => {
      update((state) => {
        return {
          ...state,
          selected: { name: null, ref: null, shouldLerp: false },
        };
      });
    },
  };
};

export const SolStore = createSolStore();
