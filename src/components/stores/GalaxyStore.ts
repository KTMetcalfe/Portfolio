import { writable } from 'svelte/store';
import type { DetailedArtistItem, DetailedTrackItem } from '../helpers/spotify';

const galaxyArms = 4;
const galaxyScale = 1000;
const galaxyTightness = 0.075;
const radialNoise = 100;
const centerOffset = 925;

const minHeightDif = 15;
const minDist = 25;

const planetLimit = 5;

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
    color: string;
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

  const getRandomPosition = (
    index: number,
    existingPositions: PositionType[]
  ) => {
    let attempt = 0;
    let maxAttempts = 1000;

    while (attempt < maxAttempts) {
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

      const newPosition = [randX, randY, randZ] as PositionType;

      let valid = true;

      for (const existingPosition of existingPositions) {
        const dx = Math.abs(newPosition[0] - existingPosition[0]);
        const dy = Math.abs(newPosition[1] - existingPosition[1]);
        const dz = Math.abs(newPosition[2] - existingPosition[2]);

        if (dx < minDist && dz < minDist && dy < minHeightDif) {
          valid = false;
          break;
        }
      }

      if (valid) {
        return newPosition;
      }

      attempt++;
    }

    console.warn('Could not find a valid position for planet');
    return [0, 0, 0] as PositionType;
  };

  const getPositionAroundStar = (index: number, radius: number) => {
    const angle = (index / planetLimit) * 2 * Math.PI;
    const x = radius * Math.cos(angle);
    const y = 0;
    const z = radius * Math.sin(angle);
    return [x, y, z] as PositionType;
  };

  function hexToRgb(hex: string) {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return rgb
      ? {
          r: parseInt(rgb[1], 16),
          g: parseInt(rgb[2], 16),
          b: parseInt(rgb[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  function rgbToHex(r: number, g: number, b: number) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function blendColors(color1: string, color2: string, ratio: number) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const blended = {
      r: Math.round(c1.r * ratio + c2.r * (1 - ratio)),
      g: Math.round(c1.g * ratio + c2.g * (1 - ratio)),
      b: Math.round(c1.b * ratio + c2.b * (1 - ratio)),
    };

    return rgbToHex(blended.r, blended.g, blended.b);
  }

  function getColorForArtist(popularity: number, followers?: number) {
    const popularityColorStart = '#FFFF00'; // yellow
    const popularityColorEnd = '#0000FF'; // blue

    const maxPopularity = 100;

    const popularityRatio = popularity / maxPopularity;

    const popularityColor = blendColors(
      popularityColorStart,
      popularityColorEnd,
      popularityRatio
    );

    // Follower count is not currently working well
    if (followers) {
      const followersColorStart = '#00FF00'; // green
      const followersColorEnd = '#FFFF00'; // yellow

      const maxFollowers = 50000000;

      const followersRatio = Math.min(followers, maxFollowers) / maxFollowers;

      const followersColor = blendColors(
        followersColorStart,
        followersColorEnd,
        followersRatio
      );

      return blendColors(popularityColor, followersColor, 0.5);
    }

    return popularityColor;
  }

  return {
    subscribe,
    addSystem: (
      artist: DetailedArtistItem,
      tracks?: Array<DetailedTrackItem>
    ) =>
      update((state) => {
        const newSystem = {
          artist,
          position: getRandomPosition(
            state.systems.size,
            [...state.systems].map(([_, system]) => system.position)
          ),
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
          color: getColorForArtist(artist.popularity),
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
