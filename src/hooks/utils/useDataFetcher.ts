import { useCallback, useEffect, useState } from 'react';

import { useMKDataFetcher, useSettings, useSpotifyDataFetcher } from 'hooks';

interface UserLibraryProps {
  inLibrary?: boolean;
  userId?: string;
}

interface CommonFetcherProps {
  name: string;
}

interface PlaylistsFetcherProps {
  name: 'playlists';
}

interface PlaylistFetcherProps extends UserLibraryProps {
  name: 'playlist';
  id: string;
}

interface AlbumsFetcherProps {
  name: 'albums';
  artworkSize?: number;
}

interface AlbumFetcherProps extends UserLibraryProps {
  name: 'album';
  id: string;
}

interface ArtistsFetcherProps {
  name: 'artists';
}

interface ArtistFetcherProps extends UserLibraryProps {
  name: 'artist';
  id: string;
  artworkSize?: number;
}

type Props = CommonFetcherProps &
  (
    | PlaylistsFetcherProps
    | PlaylistFetcherProps
    | AlbumsFetcherProps
    | AlbumFetcherProps
    | ArtistsFetcherProps
    | ArtistFetcherProps
  );

const useDataFetcher = <TType extends object>(props: Props) => {
  const spotifyDataFetcher = useSpotifyDataFetcher();
  const appleDataFetcher = useMKDataFetcher();
  const { service, isAppleAuthorized, isSpotifyAuthorized } = useSettings();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<TType>();
  const [isMounted, setIsMounted] = useState(false);

  const fetchAlbums = useCallback(async () => {
    let albums: IpodApi.Album[] | undefined;

    if (service === 'apple') {
      albums = await appleDataFetcher.fetchAlbums();
    } else if (service === 'spotify') {
      albums = await spotifyDataFetcher.fetchAlbums();
    }

    setData(albums as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchAlbum = useCallback(
    async (options: AlbumFetcherProps) => {
      let album: IpodApi.Album | undefined;

      if (service === 'apple') {
        album = await appleDataFetcher.fetchAlbum(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        album = await spotifyDataFetcher.fetchAlbum(options.userId, options.id);
      }

      setData(album as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const fetchArtists = useCallback(async () => {
    let artists: IpodApi.Artist[] | undefined;

    if (service === 'apple') {
      artists = await appleDataFetcher.fetchArtists();
    } else if (service === 'spotify') {
      artists = await spotifyDataFetcher.fetchArtists();
    }
    setData(artists as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchArtistAlbums = useCallback(
    async (options: ArtistFetcherProps) => {
      let albums: IpodApi.Album[] | undefined;

      if (service === 'apple') {
        albums = await appleDataFetcher.fetchArtistAlbums(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        albums = await spotifyDataFetcher.fetchArtist(
          options.userId,
          options.id
        );
      }

      setData(albums as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const fetchPlaylists = useCallback(async () => {
    let playlists: IpodApi.Playlist[] | undefined;

    if (service === 'apple') {
      playlists = await appleDataFetcher.fetchPlaylists();
    } else if (service === 'spotify') {
      playlists = await spotifyDataFetcher.fetchPlaylists();
    }

    setData(playlists as TType);
    setIsLoading(false);
  }, [appleDataFetcher, service, spotifyDataFetcher]);

  const fetchPlaylist = useCallback(
    async (options: PlaylistFetcherProps) => {
      let playlist: IpodApi.Playlist | undefined;

      if (service === 'apple') {
        playlist = await appleDataFetcher.fetchPlaylist(
          options.id,
          options.inLibrary
        );
      } else if (service === 'spotify') {
        playlist = await spotifyDataFetcher.fetchPlaylist(
          options.userId,
          options.id
        );
      }
      setData(playlist as TType);
      setIsLoading(false);
    },
    [appleDataFetcher, service, spotifyDataFetcher]
  );

  const handleMount = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    switch (props.name) {
      case 'albums':
        await fetchAlbums();
        break;
      case 'album':
        await fetchAlbum(props);
        break;
      case 'artists':
        await fetchArtists();
        break;
      case 'artist':
        await fetchArtistAlbums(props);
        break;
      case 'playlists':
        await fetchPlaylists();
        break;
      case 'playlist':
        await fetchPlaylist(props);
        break;
    }

    setIsMounted(true);
  }, [
    fetchAlbum,
    fetchAlbums,
    fetchArtistAlbums,
    fetchArtists,
    fetchPlaylist,
    fetchPlaylists,
    props,
  ]);

  useEffect(() => {
    if (
      !isMounted &&
      ((service === 'apple' && isAppleAuthorized) ||
        (service === 'spotify' && isSpotifyAuthorized))
    ) {
      handleMount();
    } else {
      setIsLoading(false);
    }
  }, [handleMount, isAppleAuthorized, isMounted, isSpotifyAuthorized, service]);

  return {
    isLoading,
    data,
    hasError,
  };
};

export default useDataFetcher;
