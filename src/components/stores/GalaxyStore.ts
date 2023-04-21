import { derived, writable } from 'svelte/store';
import type { DetailedArtistItem, DetailedTrackItem } from '../helpers/spotify';

const galaxyArms = 4;
const galaxyScale = 1000;
const galaxyTightness = 0.075;
const radialNoise = 100;
const centerOffset = 925;

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

const createArtistStore = () => {
  const { subscribe, set, update } = writable<Set<DetailedArtistItem>>(
    new Set()
  );

  return {
    subscribe,
    add: (artist: DetailedArtistItem) =>
      update((state) => {
        state.add(artist);
        return state;
      }),
    remove: (artist_id: string) =>
      update((state) => {
        state = new Set([...state].filter((artist) => artist.id !== artist_id));
        return state;
      }),
    contains: (artist_id: string) => {
      let found = null;
      update((state) => {
        found = [...state].find((artist) => artist.id === artist_id);
        return state;
      });
      return found !== undefined && found !== null;
    },
    clear: () => set(new Set()),
  };
};

export const ArtistStore = createArtistStore();

const createTrackStore = () => {
  const { subscribe, set, update } = writable<Set<DetailedTrackItem>>(
    new Set()
  );

  return {
    subscribe,
    add: (track: DetailedTrackItem) =>
      update((state) => {
        state.add(track);
        return state;
      }),
    remove: (track_id: string) =>
      update((state) => {
        state = new Set([...state].filter((track) => track.id !== track_id));
        return state;
      }),
    contains: (track_id: string) => {
      let found = null;
      update((state) => {
        found = [...state].find((track) => track.id === track_id);
        return state;
      });
      return found !== null;
    },
    clear: () => set(new Set()),
  };
};

export const TrackStore = createTrackStore();

// Derived store for solar systems
export const SolarSystemStore = derived(
  [ArtistStore, TrackStore],
  ([$ArtistStore, $TrackStore]) => {
    const solarSystem = new Set<{
      artist: DetailedArtistItem;
      position: [number, number, number];
    }>();
    [...$ArtistStore].forEach((artist, index) => {
      solarSystem.add({
        artist,
        position: getRandomPosition(index),
      });
    });
    return solarSystem;
  }
);

// Derived store for SolarSystems with planets (tracks)
export const SolarSystemWithPlanetsStore = derived(
  [SolarSystemStore, TrackStore],
  ([$SolarSystemStore, $TrackStore]) => {
    const solarSystemWithPlanets = new Set<{
      artist: DetailedArtistItem;
      position: [number, number, number];
      planets: Set<{
        track: DetailedTrackItem;
        position: [number, number, number];
      }>;
    }>();
    $SolarSystemStore.forEach((solarSystem) => {
      const matchingTracks = [...$TrackStore].filter(
        (track) => track.artists[0].id === solarSystem.artist.id
      );
      solarSystemWithPlanets.add({
        ...solarSystem,
        planets: new Set(
          [...matchingTracks].map((track, index) => ({
            track,
            // TODO: Make this a function
            position: getPositionAroundStar(solarSystem.position, index),
          }))
        ),
      });
    });
    return solarSystemWithPlanets;
  }
);
