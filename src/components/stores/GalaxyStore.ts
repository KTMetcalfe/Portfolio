import { writable } from 'svelte/store';
import type { DetailedArtistItem, DetailedTrackItem } from '../helpers/spotify';

const galaxyArms = 4;
const galaxyScale = 1000;
const galaxyTightness = 0.075;
const radialNoise = 100;
const centerOffset = 925;

const planetLimit = 5;

const getRandomPosition = (index: number) => {
  const armIndex = index % galaxyArms;
  const randomTheta = Math.random() * 2 * Math.PI;
  const radialDist =
    galaxyScale * Math.exp(galaxyTightness * randomTheta) - centerOffset;
  const radialDistWithNoise = radialDist + Math.random() * radialNoise;

  const randX =
    radialDistWithNoise *
    Math.cos(randomTheta + armIndex * ((2 * Math.PI) / galaxyArms));
  const randY = Math.random() * 50 - 25;
  const randZ =
    radialDistWithNoise *
    Math.sin(randomTheta + armIndex * ((2 * Math.PI) / galaxyArms));

  return [randX, randY, randZ] as [number, number, number];
};

const getPositionAroundStar = (index: number, radius: number) => {
  const angle = (index / planetLimit) * 2 * Math.PI;
  const x = radius * Math.cos(angle);
  const y = 0;
  const z = radius * Math.sin(angle);
  return [x, y, z] as [number, number, number];
};

type PositionType = [number, number, number];
type PlanetMapType = Map<
  DetailedTrackItem['id'],
  {
    track: DetailedTrackItem;
    position: PositionType;
  }
>;
type SystemMapType = Map<
  DetailedArtistItem['id'],
  {
    artist: DetailedArtistItem;
    position: PositionType;
    planets: PlanetMapType;
  }
>;
type GalaxyStoreType = {
  systems: SystemMapType;
};

// Artists are systems
// Tracks are planets
const defaultGalaxyStore: GalaxyStoreType = {
  systems: new Map(),
};
const createGalaxyStore = () => {
  const { subscribe, set, update } =
    writable<GalaxyStoreType>(defaultGalaxyStore);

  return {
    subscribe,
    addSystem: (
      artist: DetailedArtistItem,
      tracks?: Array<DetailedTrackItem>,
      position?: PositionType
    ) =>
      update((state) => {
        const newSystem = {
          artist,
          position: position ?? getRandomPosition(state.systems.size),
          planets: tracks
            ? new Map(
                tracks.map((track) => [
                  track.id,
                  {
                    track,
                    position: getPositionAroundStar(state.systems.size, 10),
                  },
                ])
              )
            : new Map(),
        };
        state.systems.set(artist.id, newSystem);
        return state;
      }),
    removeSystem: (artist_id: string) =>
      update((state) => {
        state.systems.delete(artist_id);
        return state;
      }),
    addPlanet: (track: DetailedTrackItem, position?: PositionType) =>
      update((state) => {
        const system = state.systems.get(track.artists[0].id);
        if (system !== undefined) {
          system.planets.set(track.id, {
            track,
            position:
              position ?? getPositionAroundStar(system.planets.size, 10),
          });
        }
        return state;
      }),
    removePlanet: (track_id: string) =>
      update((state) => {
        state.systems.forEach((system) => {
          system.planets.delete(track_id);
        });
        return state;
      }),
    containsSystem: (artist_id: string) => {
      let found = null;
      update((state) => {
        found = state.systems.get(artist_id);
        return state;
      });
      return found !== undefined && found !== null;
    },
    containsPlanet: (track_id: string) => {
      let found = null;
      update((state) => {
        state.systems.forEach((system) => {
          found = system.planets.get(track_id);
        });
        return state;
      });
      return found !== undefined && found !== null;
    },
    clear: () => set(defaultGalaxyStore),
  };
};

export const GalaxyStore = createGalaxyStore();
