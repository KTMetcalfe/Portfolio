export type ArtistItem = {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
};

export type DetailedArtistItem = ArtistItem & {
  followers: {
    href: string | null;
    total: number;
  };
  genres: Array<string>;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  popularity: number;
};

export type AlbumItem = {
  album_type: string;
  artists: Array<ArtistItem>;
  available_markets: Array<string>;
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
};

export type DetailedTrackItem = {
  album: AlbumItem;
  artists: Array<ArtistItem>;
  available_markets: Array<string>;
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: string;
  uri: string;
};

export type TopArtists = {
  href: string;
  items: Array<DetailedArtistItem>;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type TopTracks = {
  href: string;
  items: Array<DetailedTrackItem>;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export const getTokensFromCode = async () => {
  await fetch(`/galafy/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code: new URLSearchParams(window.location.search).get('code'),
    }),
  })
    .then((response) => response.json())
    .then((res) => {
      // Clear auth params from url
      window.history.replaceState({}, document.title, '/galafy');
      localStorage.removeItem('spotify_state');
      // Set new tokens
      localStorage.setItem('spotify_access_token', res.access_token);
      localStorage.setItem('spotify_refresh_token', res.refresh_token);
      localStorage.setItem('spotify_expires_at', res.expires_at);
    });

  return localStorage.getItem('spotify_access_token') &&
    localStorage.getItem('spotify_refresh_token')
    ? true
    : false;
};

export const getTokensFromRefresh = async () => {
  await fetch('/galafy/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh_token: localStorage.getItem('spotify_refresh_token'),
    }),
  })
    .then((response) => response.json())
    .then((res) => {
      if (!res.access_token || !res.expires_at) {
        // Clear auth params from url
        localStorage.removeItem('spotify_access_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_expires_at');
      } else {
        // Set new tokens
        localStorage.setItem('spotify_access_token', res.access_token);
        localStorage.setItem('spotify_expires_at', res.expires_at);
      }
    });

  return localStorage.getItem('spotify_access_token') &&
    localStorage.getItem('spotify_refresh_token')
    ? true
    : false;
};
