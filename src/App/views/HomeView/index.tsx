import React, { useCallback, useEffect, useState } from 'react';

import ViewOptions, {
  CoverFlowView,
  GamesView,
  MusicView,
  NowPlayingView,
  SettingsView,
} from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import { useScrollHandler } from 'hooks';
import { useAudioService } from 'services/audio';

const strings = {
  nowPlaying: "Now Playing"
};

const HomeView = () => {
  const initialOptions: SelectableListOption[] = [
    {
      label: "Cover Flow",
      value: () => <CoverFlowView />,
      viewId: ViewOptions.coverFlow.id
    },
    {
      label: "Music",
      value: () => <MusicView />,
      viewId: ViewOptions.music.id
    },
    {
      label: "Games",
      value: () => <GamesView />,
      viewId: ViewOptions.games.id
    },
    {
      label: "Settings",
      value: () => <SettingsView />,
      viewId: ViewOptions.settings.id
    }
  ];

  const [options, setOptions] = useState(initialOptions);
  const { source } = useAudioService();
  const [index] = useScrollHandler(ViewOptions.home.id, options);

  /** Append the "Now Playing" button to the list of options. */
  const showNowPlaying = useCallback(() => {
    if (
      source &&
      !options.find(option => option.label === strings.nowPlaying)
    ) {
      setOptions([
        ...options,
        {
          label: strings.nowPlaying,
          value: () => <NowPlayingView />,
          viewId: ViewOptions.nowPlaying.id
        }
      ]);
    }
  }, [options, source]);

  /** Remove the "Now Playing" button from the list of options. */
  const hideNowPlaying = useCallback(() => {
    if (options.find(option => option.label === strings.nowPlaying)) {
      setOptions(options.filter(option => option.label !== strings.nowPlaying));
    }
  }, [options]);

  /** Conditionally show "Now Playing" button if music is queued/playing. */
  useEffect(() => {
    if (source) {
      showNowPlaying();
    } else {
      hideNowPlaying();
    }
  }, [hideNowPlaying, showNowPlaying, source]);

  return <SelectableList options={options} activeIndex={index} />;
};

export default HomeView;
