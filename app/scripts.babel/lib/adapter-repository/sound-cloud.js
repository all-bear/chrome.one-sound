import {Adapter} from '../adapter';
import {Html5AdapterBehaviour} from './html5';
import {HiddenElementsTracker} from '../helper/hidden-elements-tracker';
import {AbstractAdapterRepository} from './abstract'

class SoundCloudExternalApi {
  get isReady() {
    HiddenElementsTracker.append('audio');

    return !!window.document.getElementsByTagName('audio')[0];
  }

  get audioElement() {
    return window.document.getElementsByTagName('audio')[0];
  }

  get resolvePanel() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const isPanelCreated = !!document.querySelector('.playbackSoundBadge__titleContextContainer');

        if (!isPanelCreated) {
          return;
        }

        clearInterval(interval);

        resolve();
      }, 100);
    });
  }

  get currentAudio() {
    const panelArtistHolder = document.querySelector('.playbackSoundBadge__titleContextContainer .playbackSoundBadge__lightLink');
    const panelSongHolder = document.querySelector('.playbackSoundBadge__titleContextContainer .playbackSoundBadge__titleLink [aria-hidden="true"]');

    return {
      artist: panelArtistHolder ? panelArtistHolder.innerText : 'Sound Cloud',
      song: panelSongHolder ? panelSongHolder.innerText : 'Song'
    };
  }
}

class SoundCloudAdapterBehaviour extends Html5AdapterBehaviour {
  constructor(api) {
    super(api.audioElement);

    this.api = api;
  }

  registerChangeListener(cb) {
    const wrappedCb = () => {
      this.api.resolvePanel.then(() => cb());
    };

    super.registerChangeListener(wrappedCb)
  }

  get label() {
    const data = this.api.currentAudio;

    return `${data.artist} - ${data.song}`;
  }
}

const TYPE = 'sound-cloud';
export class SoundCloudAdapterRepository extends AbstractAdapterRepository {
  get type() {
    return TYPE;
  }

  get locations() {
    return ['^soundcloud\.com']
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      const AudioApi = new SoundCloudExternalApi();
      const interval = setInterval(() => {
        if (!AudioApi.isReady) {
          return;
        }

        clearInterval(interval);

        resolve([
          new Adapter({
            type: TYPE,
            behavior: new SoundCloudAdapterBehaviour(AudioApi)
          })
        ]);
      }, 100);
    });
  }
}