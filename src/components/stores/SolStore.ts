import { derived, writable } from 'svelte/store';
import { type Mesh, Vector3 } from 'three';

type SolStoreType = {
  selected: {
    name: string | null;
    shouldLerp: boolean;
  };
  secPerYear: number;
};

type PlanetType = {
  position: Vector3;
  rotation: Vector3;
  size: number;
  orbitRatio: number;
  spinRatio: number;
};

type PlanetStoreType = Map<string, PlanetType>;

const earthDist = 100;
const earthSize = 1;

// orbitRatio is the amount of earth days for full orbit
// spinRatio is the amount of earth days for full rotation
// Distance is SCALED DOWN for the last five planets
const defaultPlanetStore: PlanetStoreType = new Map([
  [
    'Sun',
    {
      position: new Vector3(0, 0, -0 * earthDist),
      rotation: new Vector3(0, 0, 0),
      size: 20 * earthSize,
      orbitRatio: 0,
      spinRatio: 24.47,
    },
  ],
  [
    'Mercury',
    {
      position: new Vector3(0, 0, -0.39 * earthDist),
      rotation: new Vector3(0, 0, 0),
      size: 0.38 * earthSize,
      orbitRatio: 88,
      spinRatio: 59,
    },
  ],
  [
    'Venus',
    {
      position: new Vector3(0, 0, -0.72 * earthDist),
      rotation: new Vector3(0, 0, 0),
      size: 0.95 * earthSize,
      orbitRatio: 225,
      spinRatio: 243,
    },
  ],
  [
    'Earth',
    {
      position: new Vector3(0, 0, -1 * earthDist),
      rotation: new Vector3(0, 0, 0),
      size: 1 * earthSize,
      orbitRatio: 365,
      spinRatio: 1,
    },
  ],
  [
    'Mars',
    {
      position: new Vector3(0, 0, -(1.52 * earthDist) / 1.25),
      rotation: new Vector3(0, 0, 0),
      size: 0.53 * earthSize,
      orbitRatio: 687,
      spinRatio: 1.02,
    },
  ],
  [
    'Jupiter',
    {
      position: new Vector3(0, 0, -(5.2 * earthDist) / 3),
      rotation: new Vector3(0, 0, 0),
      size: 10.97 * earthSize,
      orbitRatio: 12 * 365,
      spinRatio: 0.414,
    },
  ],
  [
    'Saturn',
    {
      position: new Vector3(0, 0, -(9.54 * earthDist) / 4),
      rotation: new Vector3(0, 0, 0),
      size: 9.14 * earthSize,
      orbitRatio: 29 * 365,
      spinRatio: 0.444,
    },
  ],
  [
    'Uranus',
    {
      position: new Vector3(0, 0, -(19.18 * earthDist) / 6),
      rotation: new Vector3(0, 0, 0),
      size: 3.98 * earthSize,
      orbitRatio: 84 * 365,
      spinRatio: 0.718,
    },
  ],
  [
    'Neptune',
    {
      position: new Vector3(0, 0, -(30.06 * earthDist) / 8),
      rotation: new Vector3(0, 0, 0),
      size: 3.86 * earthSize,
      orbitRatio: 165 * 365,
      spinRatio: 0.671,
    },
  ],
]);

const createSolStore = () => {
  const { subscribe, set, update } = writable<SolStoreType>({
    selected: { name: null, shouldLerp: false },
    secPerYear: 365,
  });

  return {
    subscribe,
    set,
    update,
    select: (name: string, shouldLerp: boolean) => {
      update((state) => {
        return { ...state, selected: { name, shouldLerp } };
      });
    },
    deselect: () => {
      update((state) => {
        return {
          ...state,
          selected: { name: null, shouldLerp: false },
        };
      });
    },
    reset() {
      set({
        selected: { name: null, shouldLerp: false },
        secPerYear: 365,
      });
    },
  };
};

export const SolStore = createSolStore();

const createPlanetStore = () => {
  const { subscribe, set, update } =
    writable<PlanetStoreType>(defaultPlanetStore);

  return {
    subscribe,
    set,
    update,
    add: (name: string, planet: PlanetType) => {
      update((state) => {
        return state.set(name, planet);
      });
    },
    remove: (name: string) => {
      update((state) => {
        state.delete(name);
        return state;
      });
    },
    clear() {
      set(new Map());
    },
  };
};

export const PlanetStore = createPlanetStore();
