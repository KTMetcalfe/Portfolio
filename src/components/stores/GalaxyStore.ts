import { writable } from 'svelte/store';
import type { DetailedArtistItem } from '../helpers/spotify';

const galaxyArms = 4;
const galaxyScale = 100;
const galaxyTightness = 0.2;
const radialNoise = 50;
const centerOffset = 50;

const createArtistSystemStore = () => {
  const { subscribe, set, update } = writable<
    Map<string, { x: number; y: number; z: number; artist: DetailedArtistItem }>
  >(new Map());

  return {
    subscribe,
    add: (artist: DetailedArtistItem, x?: number, y?: number, z?: number) =>
      update((state) => {
        const armIndex = state.size % galaxyArms;
        const randomTheta = Math.random() * 2 * Math.PI;
        const radialDist =
          galaxyScale * Math.exp(galaxyTightness * randomTheta) - centerOffset;
        const radialDistWithNoise = radialDist + Math.random() * radialNoise;

        const randX = radialDistWithNoise * Math.cos(randomTheta + armIndex * (2 * Math.PI / galaxyArms));
        const randY = Math.random() * 50 - 25;
        const randZ = radialDistWithNoise * Math.sin(randomTheta + armIndex * (2 * Math.PI / galaxyArms));
        state.set(artist.id, {
          x: x || randX,
          y: y || randY,
          z: z || randZ,
          artist,
        });
        return state;
      }),
    remove: (artist_id: string) =>
      update((state) => {
        state.delete(artist_id);
        return state;
      }),
    clear: () => set(new Map()),
  };
};

export const ArtistSystemStore = createArtistSystemStore();
