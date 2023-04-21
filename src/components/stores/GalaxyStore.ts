import { writable } from 'svelte/store';
import type { DetailedArtistItem } from '../helpers/spotify';

const galaxyScale = 5;
const galaxyTightness = 0.4;

const createArtistSystemStore = () => {
  const { subscribe, set, update } = writable<
    Map<string, { x: number; y: number; z: number; artist: DetailedArtistItem }>
  >(new Map());

  return {
    subscribe,
    add: (artist: DetailedArtistItem, x?: number, y?: number, z?: number) =>
      update((state) => {
        const randomTheta = Math.random() * 2 * Math.PI;
        const radialDist =
          galaxyScale * Math.exp(galaxyTightness * randomTheta);
        const radialDistWithNoise = radialDist + Math.random() * 100;

        const randX = radialDistWithNoise * Math.cos(randomTheta);
        const randY = Math.random() * 20 - 10;
        const randZ = radialDistWithNoise * Math.sin(randomTheta);
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
