<script lang="ts">
  import type {
    DetailedArtistItem,
    DetailedTrackItem,
    TopArtists,
    TopTracks,
  } from '../../components/helpers/spotify';
  import { getTokensFromRefresh } from '../../components/helpers/spotify';
  import { Canvas, OrbitControls, T } from '@threlte/core';
  import ArtistSystem from './ArtistSystem.svelte';
  import { onMount } from 'svelte';
  import { GalaxyStore } from '../../components/stores/GalaxyStore';
  import { PerspectiveCamera, Vector3 } from 'three';
  import type { OrbitControls as OrbitControlsType } from 'three/examples/jsm/controls/OrbitControls';

  const getTopOfType = async (top_type: 'artists' | 'tracks') => {
    const response: TopArtists | TopTracks = await fetch(
      `https://api.spotify.com/v1/me/top/${top_type}?limit=50`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
    });

    return response;
  };

  const getTopArtists = async () => {
    return (await getTopOfType('artists')) as TopArtists;
  };

  const getTopTracks = async () => {
    return (await getTopOfType('tracks')) as TopTracks;
  };

  const getRelatedArtists = async (artist_id: string) => {
    const response: { artists: Array<DetailedArtistItem> } = await fetch(
      `https://api.spotify.com/v1/artists/${artist_id}/related-artists`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
    });

    return response;
  };

  const getArtistTracks = async (artist_id: string) => {
    const response: { tracks: Array<DetailedTrackItem> } = await fetch(
      `https://api.spotify.com/v1/artists/${artist_id}/top-tracks?country=US`,
      {
        headers: {
          Authorization:
            'Bearer ' + localStorage.getItem('spotify_access_token'),
        },
      }
    ).then(async (res) => {
      if (res.status === 401) {
        const isAuth = await getTokensFromRefresh();
        if (!isAuth) {
          window.location.href = '/galafy';
        }
      }
      return res.json();
    });

    return response;
  };

  const createArtistSystems = async () => {
    const topArtists = await getTopArtists();
    await Promise.all(
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist);

        const relatedArtists = await getRelatedArtists(artist.id);
        relatedArtists.artists = relatedArtists.artists.filter(
          (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
        );
        // Change amount of related artists to add here
        relatedArtists.artists.slice(0, 20).map((relatedArtist) => {
          GalaxyStore.addSystem(relatedArtist);
        });
      })
    );

    const topTracks = await getTopTracks();
    topTracks.items.map((track) => {
      const artist = track.artists[0];
      if (GalaxyStore.containsSystem(artist.id)) {
        GalaxyStore.addPlanet(track);
      }
    });
  };

  const getCameraOrbitPosition = (cameraPos: Vector3, systemPos: Vector3) => {
    // Calculate the direction vector
    const directionVector = cameraPos
      .clone()
      .sub(systemPos)
      .normalize()
      .multiplyScalar(10);

    // Calculate the new position
    const newCameraPosition = systemPos.clone().add(directionVector);
    return newCameraPosition;
  };

  const customLerp = (
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

  const changeCameraFocus = (
    target: Vector3,
    position: Vector3,
    invertAnimation?: boolean
  ) => {
    if (isCameraFocusing) return;
    isCameraFocusing = true;

    const quinticEaseInOut = (t: number) => {
      if (t < 0.5) {
        return 16 * t * t * t * t * t;
      }
      t = t - 1;
      return 1 + 16 * t * t * t * t * t;
    };

    if (invertAnimation) {
      // Lerp from current camera target to new camera target
      customLerp(
        cameraRef.position.clone(),
        position,
        750,
        (current) => {
          cameraRef.position.copy(current);
          controlsRef.update();
        },
        quinticEaseInOut
      ).then(() => {
        // Lerp from current camera position to new camera position
        customLerp(
          controlsRef.target.clone(),
          target,
          500,
          (current) => {
            controlsRef.target.set(current.x, current.y, current.z);
            controlsRef.update();
          },
          quinticEaseInOut
        ).then(() => {
          isCameraFocusing = false;
        });
      });
    } else {
      customLerp(
        controlsRef.target.clone(),
        target,
        1000,
        (current) => {
          controlsRef.target.set(current.x, current.y, current.z);
          controlsRef.update();
        },
        quinticEaseInOut
      ).then(() => {
        customLerp(
          cameraRef.position.clone(),
          position,
          1500,
          (current) => {
            cameraRef.position.copy(current);
            controlsRef.update();
          },
          quinticEaseInOut
        ).then(() => {
          isCameraFocusing = false;
        });
      });
    }
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

  function getColorForArtist(popularity: number, followers: number) {
    const popularityColorStart = '#FFFF00'; // yellow
    const popularityColorEnd = '#0000FF'; // blue

    const followersColorStart = '#00FF00'; // green
    const followersColorEnd = '#FFFF00'; // yellow

    const maxPopularity = 100;
    const maxFollowers = 50000000;

    const popularityRatio = popularity / maxPopularity;
    const followersRatio = Math.min(followers, maxFollowers) / maxFollowers;

    const popularityColor = blendColors(
      popularityColorStart,
      popularityColorEnd,
      popularityRatio
    );
    const followersColor = blendColors(
      followersColorStart,
      followersColorEnd,
      followersRatio
    );

    // Follower count is not currently working well
    // return blendColors(popularityColor, followersColor, 0.5);
    return popularityColor;
  }

  onMount(() => {
    createArtistSystems();
    return () => {
      GalaxyStore.clear();
    };
  });

  let cameraRef: PerspectiveCamera;
  let controlsRef: OrbitControlsType;

  let isCameraFocusing = false;
  let selectedSystemId: string | null = null;
</script>

<div
  class="w-full h-[calc(100vh-4rem)] overflow-hidden bg-black"
  on:contextmenu|preventDefault={() =>
    changeCameraFocus(new Vector3(0, 0, 0), new Vector3(750, 750, 0), true)}
>
  <Canvas>
    <T.PerspectiveCamera
      bind:ref={cameraRef}
      makeDefault
      fov={72}
      position={[750, 750, 0]}
    >
      <OrbitControls
        bind:controls={controlsRef}
        enablePan={false}
        target={{
          x: 0,
          y: 0,
          z: 0,
        }}
      />
    </T.PerspectiveCamera>

    <T.DirectionalLight castShadow position={[3, 10, 10]} />
    <T.DirectionalLight position={[-3, 10, -10]} intensity={0.2} />
    <T.AmbientLight intensity={0.2} />

    {#each [...$GalaxyStore.systems] as system, i (system[0])}
      <ArtistSystem
        artist={system[1].artist}
        position={system[1].position}
        color={selectedSystemId === system[1].artist.id
          ? ''
          : getColorForArtist(
              system[1].artist.popularity,
              system[1].artist.followers.total
            )}
        planets={system[1].planets}
        clickCallback={() => {
          console.log(
            system,
            system[1].artist.popularity,
            system[1].artist.followers.total
          );
          if (selectedSystemId !== system[1].artist.id && !isCameraFocusing) {
            selectedSystemId = system[1].artist.id;
            const systemPosition = new Vector3(
              system[1].position[0],
              system[1].position[1],
              system[1].position[2]
            );
            changeCameraFocus(
              systemPosition,
              getCameraOrbitPosition(cameraRef.position, systemPosition)
            );
          }
        }}
      />
    {/each}
  </Canvas>
</div>
