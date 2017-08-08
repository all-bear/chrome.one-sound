import {Adapter} from '../adapter';
import {Html5AdapterBehaviour} from './html5';
import {AbstractAdapterRepository} from './abstract'

class GoogleMusicExternalApi {
  get audioElements() {
    return Array.prototype.slice.call(window.document.getElementsByTagName('audio'), 0);
  }

  get currentAudio() {
    const panelArtistHolder = document.querySelector('#player-artist');
    const panelSongHolder = document.querySelector('#currently-playing-title');

    return {
      artist: panelArtistHolder ? panelArtistHolder.innerText : 'Google Music',
      song: panelSongHolder ? panelSongHolder.innerText : 'Song'
    };
  }
}

class GoogleMusicAdapterBehaviour extends Html5AdapterBehaviour {
  constructor(api, element) {
    super(element);

    this.api = api;
  }

  get isPlayed() {
    return !this.isEndOfQueue && super.isPlayed;
  }

  registerChangeListener(cb) {
    if (!this.changeInterval) {
      this.changeInterval = setInterval(() => {
        if (this.label !== this.prevLabel) {
          cb.call();
        }

        this.prevLabel = this.label;
      }, 500);
    }

    this.element.addEventListener('playing', () => {
      this.isEndOfQueue = false;
    });

    this.element.addEventListener('pause', () => {
      if (this.playButton.disabled !== null) { //end of queue
        this.isEndOfQueue = true;
        cb.call();
      } else {
        this.isEndOfQueue = false;
      }
    });

    super.registerChangeListener(cb);
  }

  get label() {
    const data = this.api.currentAudio;

    return `${data.artist} - ${data.song}`;
  }

  get playButton() {
    return document.getElementById('player-bar-play-pause');
  }

  isPlayButtonReadyToPlay(playButton) {
    return !playButton.classList.contains('playing')
  }

  play() {
    this.isPlayTriggeredProgrammatically = true;
    if (this.isPlayButtonReadyToPlay(this.playButton)) {
      this.playButton.click();
    }
  }

  pause() {
    this.isPauseTriggeredProgrammatically = true;
    if (!this.isPlayButtonReadyToPlay(this.playButton)) {
      this.playButton.click();
    }
  }
}

const TYPE = 'google-music';
export class GoogleMusicAdapterRepository extends AbstractAdapterRepository {
  get type() {
    return TYPE;
  }

  get locations() {
    return ['play\.google\.com']
  }

  onLoad(repositoryAdapter) {
    const AudioApi = new GoogleMusicExternalApi();

    let prevAudioCount = 0;
    const interval = setInterval(() => {
      if (AudioApi.audioElements.length <= prevAudioCount) {
        return;
      }

      const newAudioElements = AudioApi.audioElements.slice(-(AudioApi.audioElements.length - prevAudioCount));

      newAudioElements.forEach((element) => {
        if (!element.getAttribute('src')) {
          return;
        }
        repositoryAdapter.process(this, new Adapter({
          type: TYPE,
          behavior: new GoogleMusicAdapterBehaviour(AudioApi, element)
        }));
      });

      prevAudioCount += newAudioElements.length;
    }, 1000);
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }
}