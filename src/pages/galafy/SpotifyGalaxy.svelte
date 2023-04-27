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

  const getAvailableGenres = async () => {
    const response: { genres: Array<string> } = await fetch(
      'https://api.spotify.com/v1/recommendations/available-genre-seeds',
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
    await getAvailableGenres().then((genres) => {
      genres.genres.map((g) => {
        GalaxyStore.addGenre(g);
      });
    });

    getTopArtists().then((topArtists) => {
      topArtists.items.map(async (artist) => {
        GalaxyStore.addSystem(artist);

        getRelatedArtists(artist.id).then((relatedArtists) => {
          relatedArtists.artists = relatedArtists.artists.filter(
            (relatedArtist) => !GalaxyStore.containsSystem(relatedArtist.id)
          );
          // Change amount of related artists to add here
          relatedArtists.artists.slice(0, 20).map(async (relatedArtist) => {
            GalaxyStore.addSystem(relatedArtist);
          });

          getTopTracks().then((topTracks) => {
            topTracks.items.forEach((track) => {
              const artist = track.artists[0];
              if (GalaxyStore.containsSystem(artist.id)) {
                GalaxyStore.addPlanet(track);
              }
            });
          });
        });
      });
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

  function intToHex(i: number) {
    const r = (i >> 16) & 255;
    const g = (i >> 8) & 255;
    const b = i & 255;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function blendColors(colors: Array<string>) {
    const rValues = colors.map((color) =>
      parseInt(color.slice(4, color.indexOf(',')))
    );
    const gValues = colors.map((color) =>
      parseInt(color.slice(color.indexOf(',') + 1, color.lastIndexOf(',')))
    );
    const bValues = colors.map((color) =>
      parseInt(color.slice(color.lastIndexOf(',') + 1, color.indexOf(')')))
    );

    const r = Math.round(rValues.reduce((a, b) => a + b) / rValues.length);
    const g = Math.round(gValues.reduce((a, b) => a + b) / gValues.length);
    const b = Math.round(bValues.reduce((a, b) => a + b) / bValues.length);

    return intToHex((r << 16) + (g << 8) + b);
  }

  function getColorForGenres(genres: Array<string>) {
    const colors = genres
      .filter((genre) => $GalaxyStore.genreColors?.has(genre))
      .map(
        (genre) => $GalaxyStore.genreColors?.get(genre) || 'rgb(128, 128, 128)'
      );
    return colors.length < 1 ? '#334455' : blendColors(colors);
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
          : getColorForGenres(system[1].artist.genres)}
        planets={system[1].planets}
        clickCallback={() => {
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
