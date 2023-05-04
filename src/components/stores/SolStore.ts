import { derived, writable } from 'svelte/store';
import { type Mesh, Vector3, MathUtils, Euler } from 'three';

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
  zeroDate: Date;
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
      zeroDate: new Date('2000-01-01T00:00:00.000Z'),
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
      zeroDate: new Date('2000-02-01T00:00:00.000Z'),
    },
  ],
  [
    'Venus',
    {
      position: new Vector3(0, 0, -0.72 * earthDist),
      rotation: new Vector3(0, 0, 0),
      size: 0.95 * earthSize,
      orbitRatio: 225,
      spinRatio: -243,
      zeroDate: new Date('2000-04-20T00:00:00.000Z'),
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
      zeroDate: new Date('2000-09-23T00:00:00.000Z'),
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
      zeroDate: new Date('2000-01-01T00:00:00.000Z'),
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
      zeroDate: new Date('2010-09-18T00:00:00.000Z'),
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
      zeroDate: new Date('2025-08-12T00:00:00.000Z'),
    },
  ],
  [
    'Uranus',
    {
      position: new Vector3(0, 0, -(19.18 * earthDist) / 6),
      rotation: new Vector3(0, 0, 0),
      size: 3.98 * earthSize,
      orbitRatio: 84 * 365,
      spinRatio: -0.718,
      zeroDate: new Date('2010-09-27T00:00:00.000Z'),
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
      zeroDate: new Date('2024-07-21T00:00:00.000Z'),
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

  // TODO: Figure out how to get more specific positions
  // Math might be wrong, but so can the data for true anomaly of 0
  // https://colab.research.google.com/drive/19ALDzv9HkH3jpFNEH6PDrVUEsQ5poSrD
  const calculateCurrentPlanetPositions = () => {
    const currentDate = new Date();

    update((state) => {
      state.forEach((planet, name) => {
        const timeSinceZero = currentDate.getTime() - planet.zeroDate.getTime();
        const days = timeSinceZero / (1000 * 3600 * 24);
        // Complete 1 orbit (365 / orbitRatio) in 1 year (revTime)
        const offsetEuler = new Euler(
          MathUtils.degToRad(0),
          MathUtils.degToRad(
            planet.orbitRatio === 0 ? 0 : (360 / planet.orbitRatio) * days
          ),
          MathUtils.degToRad(0)
        );

        const newPos = planet.position.clone().applyEuler(offsetEuler);
        planet.position.copy(newPos);

        // Complete (365 / spinRatio) rotations in 1 year (revTime)
        planet.rotation.set(
          planet.rotation.x,
          (planet.rotation.y += MathUtils.degToRad(
            (360 / planet.spinRatio) * days
          )),
          planet.rotation.z
        );
      });
      return state;
    });
  };

  calculateCurrentPlanetPositions();

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
